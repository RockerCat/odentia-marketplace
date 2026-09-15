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

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE_PAGO: "bg-warning/10 text-warning",
  PAGADO: "bg-success/10 text-success",
  ENVIADO: "bg-info/10 text-info",
  CANCELADO: "bg-danger/10 text-danger",
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

      <h1 className="text-2xl font-bold text-foreground mb-6">Pedidos</h1>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted-foreground text-left">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-muted-foreground" colSpan={5}>
                  Todavía no hay pedidos.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-foreground/5">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    #{order.id.slice(-8)}
                  </Link>
                </td>
                <td className="px-5 py-3">{order.customerName}</td>
                <td className="px-5 py-3">{formatPrice(order.totalCents)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
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
