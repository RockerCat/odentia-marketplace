"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { OrderStatus } from "@/generated/prisma/client";

export async function updateOrderStatusAction(formData: FormData) {
  await verifySession();

  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));

  if (!(status in OrderStatus)) {
    throw new Error("Estado inválido.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  redirect(`/admin/pedidos/${orderId}?success=Estado del pedido actualizado.`);
}
