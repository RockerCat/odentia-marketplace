import Link from "next/link";
import { getCartItems, getCartTotalCents } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { updateCartItemAction, removeFromCartAction } from "./actions";

export default async function CartPage() {
  const items = await getCartItems();
  const total = await getCartTotalCents();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Tu carrito</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">
          Tu carrito está vacío.{" "}
          <Link href="/" className="text-teal-700 hover:underline">
            Ver catálogo
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-5 gap-4"
              >
                <div className="flex-1">
                  <Link
                    href={`/productos/${item.product.slug}`}
                    className="font-semibold text-slate-900 hover:text-teal-700"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-slate-400">
                    {formatPrice(item.product.priceCents)} c/u
                  </p>
                </div>

                <form action={updateCartItemAction} className="flex items-center gap-2">
                  <input type="hidden" name="productId" value={item.product.id} />
                  <input
                    type="number"
                    name="quantity"
                    defaultValue={item.quantity}
                    min={0}
                    max={item.product.stock}
                    className="w-16 rounded-md border-slate-300 text-center text-sm"
                  />
                  <button type="submit" className="text-sm text-teal-700 hover:underline">
                    Actualizar
                  </button>
                </form>

                <p className="w-24 text-right font-semibold text-slate-900">
                  {formatPrice(item.subtotalCents)}
                </p>

                <form action={removeFromCartAction}>
                  <input type="hidden" name="productId" value={item.product.id} />
                  <button type="submit" className="text-sm text-red-500 hover:underline">
                    Quitar
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xl font-bold text-slate-900">
              Total: {formatPrice(total)}
            </p>
            <Link
              href="/checkout"
              className="bg-teal-700 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-800"
            >
              Continuar al checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
