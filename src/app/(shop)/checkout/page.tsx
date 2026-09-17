import { redirect } from "next/navigation";
import { getCartItems, getCartTotalCents } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getCustomerSession } from "@/lib/customer-session";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const items = await getCartItems();

  if (items.length === 0) {
    redirect("/carrito");
  }

  const total = await getCartTotalCents();
  // Pre-fill convenience only — never re-attributed, see resolveOrderAttribution
  // in actions.ts, which reads the session independently at submit time.
  const customer = await getCustomerSession();

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar pedido</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <CheckoutForm
          initialCustomerName={customer ? `${customer.firstName} ${customer.lastName}`.trim() : undefined}
          initialCustomerEmail={customer?.email}
        />

        <aside className="lg:w-80 shrink-0 bg-background rounded-xl border border-border p-6 h-fit">
          <h2 className="font-semibold text-foreground mb-4">Resumen</h2>
          <ul className="space-y-3 text-sm mb-4">
            {items.map((item) => (
              <li key={item.product.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.product.name} &times; {item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  {formatPrice(item.subtotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-4 flex justify-between font-bold text-foreground">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
