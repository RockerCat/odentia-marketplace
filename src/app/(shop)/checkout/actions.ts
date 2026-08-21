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
} | undefined;

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

  const order = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        ...parsed.data,
        totalCents,
        status: "PENDIENTE_PAGO",
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            unitPriceCents: item.product.priceCents,
            quantity: item.quantity,
            subtotalCents: item.subtotalCents,
          })),
        },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return order;
  });

  await clearCart();

  redirect(`/pedido/${order.id}/gracias`);
}
