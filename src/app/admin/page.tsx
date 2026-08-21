import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import FlashMessage from "./flash-message";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE_PAGO: "pendiente pago",
  PAGADO: "pagado",
  ENVIADO: "enviado",
  CANCELADO: "cancelado",
};

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin">) {
  const { success, error } = await searchParams;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <FlashMessage
        success={typeof success === "string" ? success : undefined}
        error={typeof error === "string" ? error : undefined}
      />

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Pedidos</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-slate-400" colSpan={5}>
                  Todavía no hay pedidos.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-teal-700 font-medium hover:underline"
                  >
                    #{order.id.slice(-8)}
                  </Link>
                </td>
                <td className="px-5 py-3">{order.customerName}</td>
                <td className="px-5 py-3">{formatPrice(order.totalCents)}</td>
                <td className="px-5 py-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-slate-100">
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {order.createdAt.toLocaleString("es", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
