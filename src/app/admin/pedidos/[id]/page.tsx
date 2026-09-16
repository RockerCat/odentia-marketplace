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

// Labels are presentation-only — coreRole itself keeps being persisted
// verbatim (see prisma/schema.prisma), never rewritten to match this map.
const CORE_ROLE_LABELS: Record<string, string> = {
  clinic_admin: "Administrador de clínica",
  dentist: "Odontólogo",
  assistant: "Asistente",
};

type OrderOrigin =
  | { kind: "guest" }
  | { kind: "patient" }
  | { kind: "clinic_member"; clinicId: string; roleLabel: string }
  // Defensive only: the order_buyer_attribution_shape DB CHECK (see
  // prisma/migrations/20260915150000_add_order_buyer_type) already makes
  // this impossible for any order this app ever writes — this branch
  // exists purely so the UI never guesses at an attribution from a partial
  // shape if it ever encountered one (legacy/manual data), rather than
  // trusting it wasn't validated at write time.
  | { kind: "inconsistent" };

// Classifies against the exact three shapes order_buyer_attribution_shape
// enforces — never inferred from a single field in isolation. This is
// purely a display classification: it never grants access, never triggers
// a lookup, and coreRole here is only ever the snapshot taken at purchase
// time, not the person's role today. A patient order intentionally shows
// no clinic — it never had one to show (see the buyer-identity/
// clinic-attribution audit).
function resolveOrderOrigin(order: {
  coreUserId: string | null;
  buyerType: string | null;
  clinicId: string | null;
  membershipId: string | null;
  coreRole: string | null;
}): OrderOrigin {
  const { coreUserId, buyerType, clinicId, membershipId, coreRole } = order;

  if (buyerType === null && coreUserId === null && clinicId === null && membershipId === null && coreRole === null) {
    return { kind: "guest" };
  }

  if (buyerType === "patient" && coreUserId !== null && clinicId === null && membershipId === null && coreRole === null) {
    return { kind: "patient" };
  }

  if (
    buyerType === "clinic_member" &&
    coreUserId !== null &&
    clinicId !== null &&
    membershipId !== null &&
    coreRole !== null
  ) {
    return { kind: "clinic_member", clinicId, roleLabel: CORE_ROLE_LABELS[coreRole] ?? coreRole };
  }

  return { kind: "inconsistent" };
}

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

  const origin = resolveOrderOrigin(order);

  return (
    <div>
      <Link href="/admin" className="text-sm text-primary hover:underline">
        &larr; Volver a pedidos
      </Link>

      <div className="mt-4">
        <FlashMessage
          success={typeof success === "string" ? success : undefined}
          error={typeof error === "string" ? error : undefined}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-background rounded-xl border border-border p-6">
          <h1 className="text-xl font-bold text-foreground mb-4">
            Pedido #{order.id.slice(-8)}
          </h1>

          <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <dt className="text-label-foreground">Cliente</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-label-foreground">Correo</dt>
              <dd className="font-medium">{order.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-label-foreground">Teléfono</dt>
              <dd className="font-medium">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-label-foreground">Fecha</dt>
              <dd className="font-medium">
                {order.createdAt.toLocaleString("es")}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-label-foreground">Dirección</dt>
              <dd className="font-medium">{order.address}</dd>
            </div>
            {order.notes && (
              <div className="col-span-2">
                <dt className="text-label-foreground">Notas</dt>
                <dd className="font-medium">{order.notes}</dd>
              </div>
            )}
          </dl>

          <table className="w-full text-sm mb-4">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2">Cant.</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">
                    {item.productName}
                    {item.optionLabel && (
                      <span className="text-muted-foreground"> ({item.optionLabel})</span>
                    )}
                  </td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatPrice(item.subtotalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between font-bold text-foreground border-t border-border pt-4">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        <div className="lg:w-72 shrink-0 space-y-6">
          <div className="bg-background rounded-xl border border-border p-6 h-fit">
            <h2 className="font-semibold text-foreground mb-4">Origen del pedido</h2>

            {origin.kind === "guest" && (
              <div className="space-y-2 text-sm">
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-surface text-muted-foreground">
                  Invitado
                </span>
                <p className="text-muted-foreground">
                  Pedido realizado directamente en Marketplace sin una sesión de cliente Odentia.
                </p>
              </div>
            )}

            {origin.kind === "patient" && (
              <div className="space-y-2 text-sm">
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Paciente Odentia
                </span>
                <p className="text-muted-foreground">
                  Pedido de un paciente autenticado de Odentia. Sin atribución a ninguna clínica.
                </p>
              </div>
            )}

            {origin.kind === "clinic_member" && (
              <div className="space-y-3 text-sm">
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Cliente Odentia
                </span>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-label-foreground">Clínica</dt>
                    <dd className="font-medium break-all">{origin.clinicId}</dd>
                  </div>
                  <div>
                    <dt className="text-label-foreground">Rol al momento del pedido</dt>
                    <dd className="font-medium">{origin.roleLabel}</dd>
                  </div>
                </dl>
              </div>
            )}

            {origin.kind === "inconsistent" && (
              <div className="space-y-2 text-sm">
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  Atribución no disponible
                </span>
                <p className="text-muted-foreground">
                  Este pedido tiene datos de atribución incompletos.
                </p>
              </div>
            )}
          </div>

          <div className="bg-background rounded-xl border border-border p-6 h-fit">
            <h2 className="font-semibold text-foreground mb-4">Estado del pedido</h2>
            <form action={updateOrderStatusAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="w-full text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                Actualizar estado
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
