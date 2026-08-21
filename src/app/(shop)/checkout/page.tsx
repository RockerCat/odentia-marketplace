import { redirect } from "next/navigation";
import { getCartItems, getCartTotalCents } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const items = await getCartItems();

  if (items.length === 0) {
    redirect("/carrito");
  }

  const total = await getCartTotalCents();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Finalizar pedido</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <CheckoutForm />

        <aside className="lg:w-80 shrink-0 bg-white rounded-xl border border-slate-200 p-6 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Resumen</h2>
          <ul className="space-y-3 text-sm mb-4">
            {items.map((item) => (
              <li key={item.product.id} className="flex justify-between">
                <span className="text-slate-600">
                  {item.product.name} &times; {item.quantity}
                </span>
                <span className="font-medium text-slate-900">
                  {formatPrice(item.subtotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
