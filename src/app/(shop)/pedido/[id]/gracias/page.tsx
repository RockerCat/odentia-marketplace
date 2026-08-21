import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE_PAGO: "pendiente de pago",
  PAGADO: "pagado",
  ENVIADO: "enviado",
  CANCELADO: "cancelado",
};

export default async function OrderConfirmationPage({
  params,
}: PageProps<"/pedido/[id]/gracias">) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-xl mx-auto text-center bg-white rounded-xl border border-slate-200 p-10">
      <p className="text-teal-700 font-semibold mb-2">¡Gracias, {order.customerName}!</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        Tu pedido #{order.id.slice(-8)} fue recibido
      </h1>
      <p className="text-slate-500 mb-6">
        Nos pondremos en contacto a <strong>{order.customerEmail}</strong> para coordinar el
        pago ({STATUS_LABELS[order.status]}) y la entrega.
      </p>

      <ul className="text-left space-y-2 text-sm mb-6">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span className="text-slate-600">
              {item.productName} &times; {item.quantity}
            </span>
            <span className="font-medium text-slate-900">
              {formatPrice(item.subtotalCents)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-slate-900 mb-8">
        <span>Total</span>
        <span>{formatPrice(order.totalCents)}</span>
      </div>

      <Link href="/" className="text-teal-700 font-medium hover:underline">
        Volver al catálogo
      </Link>
    </div>
  );
}
