"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCartItems, clearCart } from "@/lib/cart";
import { generateOrderAccessToken, grantOrderAccess, hashOrderAccessToken } from "@/lib/order-access";
import { getCustomerSession, type CustomerIdentity } from "@/lib/customer-session";

// The one place that turns a certified customer identity into the five
// Order attribution columns — mirrors order_buyer_attribution_shape (see
// that CHECK constraint's own migration) exactly, so this function can
// never produce a shape the DB would reject. Guest (null session) and
// Patient both leave clinicId/membershipId/coreRole null; only a real
// clinic member ever gets clinic attribution — a Patient's own linked
// clinic is never read or written here, by construction (PatientIdentity
// has no clinicId field to read in the first place).
function resolveOrderAttribution(customerSession: CustomerIdentity | null) {
  if (!customerSession) {
    return { coreUserId: null, buyerType: null, clinicId: null, membershipId: null, coreRole: null };
  }

  if (customerSession.buyerType === "patient") {
    return {
      coreUserId: customerSession.coreUserId,
      buyerType: "patient",
      clinicId: null,
      membershipId: null,
      coreRole: null,
    };
  }

  return {
    coreUserId: customerSession.coreUserId,
    buyerType: "clinic_member",
    clinicId: customerSession.clinicId,
    membershipId: customerSession.membershipId,
    coreRole: customerSession.role,
  };
}

const CheckoutSchema = z.object({
  customerName: z.string().min(1, "El nombre es obligatorio."),
  customerEmail: z.email("Ingresa un correo válido."),
  customerPhone: z.string().min(1, "El teléfono es obligatorio."),
  address: z.string().min(1, "La dirección es obligatoria."),
  notes: z.string().optional(),
});

export type CheckoutState = {
  errors?: Partial<Record<keyof z.infer<typeof CheckoutSchema>, string>>;
  formError?: string;
} | undefined;

// Thrown inside the $transaction below to force a full rollback when a
// product's stock can't cover the requested quantity anymore — caught
// outside the transaction and turned into a user-facing formError, never
// leaked as a raw Prisma/Postgres error.
class OutOfStockError extends Error {}

// True only for the P2002 unique-constraint violation on Order.idempotencyKey
// — the signal that a concurrent request already created (or is
// simultaneously creating) the Order for this exact checkout attempt. Any
// other P2002 (or other error) must keep surfacing as a real failure, never
// get silently treated as success.
function isIdempotencyKeyConflict(err: unknown): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") {
    return false;
  }
  const target = err.meta?.target;
  if (Array.isArray(target)) return target.includes("idempotencyKey");
  if (typeof target === "string") return target.includes("idempotencyKey");
  return false;
}

async function redirectToExistingOrder(orderId: string): Promise<never> {
  // The purchase this key represents already exists (created by an earlier
  // request, or by whichever concurrent request won the race) — bring the
  // caller to the exact same result a fresh success would have produced.
  // Safe to call even if the winning request already cleared it.
  //
  // Re-issues a fresh access token/cookie for the order rather than trying
  // to recover whatever token the original request may have issued (which
  // is impossible — only its hash is stored, never the raw value, and that
  // original response may never have reached the browser at all, which is
  // exactly the case a retry exists to cover). Reaching this function at
  // all already required presenting the correct idempotencyKey, so
  // re-granting access here is granting it to the same legitimate browser,
  // not to a new party — see src/lib/order-access.ts.
  const token = generateOrderAccessToken();
  await prisma.order.update({
    where: { id: orderId },
    data: { accessTokenHash: hashOrderAccessToken(token) },
  });
  await grantOrderAccess(orderId, token);

  await clearCart();
  redirect(`/pedido/${orderId}/gracias`);
}

export async function placeOrderAction(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "").trim();
  if (!idempotencyKey) {
    // Only reachable if the hidden field was missing/stripped — never
    // happens through the real form, but without a key there is nothing to
    // dedupe against.
    return {
      formError: "No pudimos procesar el pedido. Recarga la página e intenta de nuevo.",
    };
  }

  // Fast path for a retry (double submit, dropped response the user
  // resubmits): if this exact checkout attempt already produced an Order,
  // go straight to its confirmation — before even looking at cart/stock
  // state, since by the time a retry arrives the cart may have already been
  // cleared by the request that succeeded. This is an optimization only;
  // the UNIQUE constraint below is what actually guarantees correctness
  // under real concurrency.
  const existingOrder = await prisma.order.findUnique({
    where: { idempotencyKey },
    select: { id: true },
  });
  if (existingOrder) {
    await redirectToExistingOrder(existingOrder.id);
  }

  const items = await getCartItems();

  if (items.length === 0) {
    redirect("/carrito");
  }

  const parsed = CheckoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    address: formData.get("address"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    const errors: NonNullable<CheckoutState>["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof errors;
      errors[field] = issue.message;
    }
    return { errors };
  }

  const totalCents = items.reduce((sum, item) => sum + item.subtotalCents, 0);
  const accessToken = generateOrderAccessToken();
  // Read exactly once, here, on the branch that is actually about to create
  // a NEW Order — never inside redirectToExistingOrder(). Attribution is
  // decided once at creation and must never drift on a retry: a resubmit
  // always short-circuits via the idempotencyKey lookup above before this
  // line is ever reached, so a session that changed/expired/disappeared
  // between attempts can never touch an already-created Order's
  // attribution. null (no session, or an invalid/expired one) simply means
  // a guest order — getCustomerSession() never throws.
  const customerSession = await getCustomerSession();

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Conditional UPDATE (stock decrement gated on stock >= quantity in
      // the same statement) instead of a read-then-write: the row lock
      // Postgres takes for the UPDATE makes this safe under concurrent
      // checkouts for the same product — a `findUnique` check beforehand
      // would not be, since another transaction could decrement the stock
      // in between the read and the write.
      for (const item of items) {
        const result = await tx.product.updateMany({
          where: { id: item.product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          throw new OutOfStockError();
        }
      }

      return tx.order.create({
        data: {
          ...parsed.data,
          idempotencyKey,
          accessTokenHash: hashOrderAccessToken(accessToken),
          totalCents,
          status: "PENDIENTE_PAGO",
          // Trust boundary: these five values come ONLY from the
          // server-verified customerSession above — never from formData,
          // a hidden input, or any other client-supplied value. parsed.data
          // (customerName/Email/Phone/address/notes) stays the independent
          // order/contact snapshot regardless of who's attributed.
          ...resolveOrderAttribution(customerSession),
          items: {
            create: items.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              optionLabel: item.option,
              unitPriceCents: item.product.priceCents,
              quantity: item.quantity,
              subtotalCents: item.subtotalCents,
            })),
          },
        },
      });
    });
  } catch (err) {
    if (err instanceof OutOfStockError) {
      return {
        formError:
          "Uno o más productos ya no tienen stock suficiente. Revisa tu carrito antes de continuar.",
      };
    }

    // Lost the race: a concurrent request with this same idempotencyKey
    // committed first. Our own transaction (including its stock decrements)
    // was rolled back by Postgres when order.create() hit the UNIQUE
    // violation, so stock was only ever decremented once, by the winner.
    // Surface the winner's order instead of an error.
    if (isIdempotencyKeyConflict(err)) {
      const winner = await prisma.order.findUnique({
        where: { idempotencyKey },
        select: { id: true },
      });
      if (winner) {
        await redirectToExistingOrder(winner.id);
      }
    }

    throw err;
  }

  await grantOrderAccess(order.id, accessToken);
  await clearCart();

  redirect(`/pedido/${order.id}/gracias`);
}
