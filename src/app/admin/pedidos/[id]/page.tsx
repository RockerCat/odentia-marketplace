import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import FlashMessage from "../../flash-message";
import { updateOrderStatusAction } from "../actions";

const STATUS_OPTIONS = [
  { value: "PENDIENTE_PAGO", label: "Pendiente de pago" },
  { value: "PAGADO", label: "Pagado" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "CANCELADO", label: "Cancelado" },
];

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const { success, error } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-teal-700 hover:underline">
        &larr; Volver a pedidos
      </Link>

      <div className="mt-4">
        <FlashMessage
          success={typeof success === "string" ? success : undefined}
          error={typeof error === "string" ? error : undefined}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-4">
            Pedido #{order.id.slice(-8)}
          </h1>

          <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <dt className="text-slate-400">Cliente</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Correo</dt>
              <dd className="font-medium">{order.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Teléfono</dt>
              <dd className="font-medium">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Fecha</dt>
              <dd className="font-medium">
                {order.createdAt.toLocaleString("es")}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-400">Dirección</dt>
              <dd className="font-medium">{order.address}</dd>
            </div>
            {order.notes && (
              <div className="col-span-2">
                <dt className="text-slate-400">Notas</dt>
                <dd className="font-medium">{order.notes}</dd>
              </div>
            )}
          </dl>

          <table className="w-full text-sm mb-4">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2">Cant.</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">{item.productName}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatPrice(item.subtotalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-4">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        <div className="lg:w-72 shrink-0 bg-white rounded-xl border border-slate-200 p-6 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Estado del pedido</h2>
          <form action={updateOrderStatusAction} className="space-y-3">
            <input type="hidden" name="orderId" value={order.id} />
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded-md border-slate-300 text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-800"
            >
              Actualizar estado
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
