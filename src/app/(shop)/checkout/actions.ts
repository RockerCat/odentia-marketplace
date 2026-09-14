"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCartItems, clearCart } from "@/lib/cart";

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

export async function placeOrderAction(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
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
          totalCents,
          status: "PENDIENTE_PAGO",
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
    throw err;
  }

  await clearCart();

  redirect(`/pedido/${order.id}/gracias`);
}
