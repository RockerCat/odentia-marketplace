import Link from "next/link";
import { getCartItems, getCartTotalCents } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { updateCartItemAction, removeFromCartAction } from "./actions";

export default async function CartPage() {
  const items = await getCartItems();
  const total = await getCartTotalCents();

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Tu carrito</h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground">
          Tu carrito está vacío.{" "}
          <Link href="/" className="text-primary hover:underline">
            Ver catálogo
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="bg-background rounded-xl border border-border divide-y divide-border">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-5 gap-4"
              >
                <div className="flex-1">
                  <Link
                    href={`/productos/${item.product.slug}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  {item.option && (
                    <p className="text-sm text-primary">Opción: {item.option}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.product.priceCents)} c/u
                  </p>
                </div>

                <form action={updateCartItemAction} className="flex items-center gap-2">
                  <input type="hidden" name="key" value={item.key} />
                  <input
                    type="number"
                    name="quantity"
                    defaultValue={item.quantity}
                    min={0}
                    max={item.product.stock}
                    className="w-16 text-center text-sm"
                  />
                  <button type="submit" className="text-sm text-primary hover:underline">
                    Actualizar
                  </button>
                </form>

                <p className="w-24 text-right font-semibold text-foreground">
                  {formatPrice(item.subtotalCents)}
                </p>

                <form action={removeFromCartAction}>
                  <input type="hidden" name="key" value={item.key} />
                  <button type="submit" className="text-sm text-danger hover:underline">
                    Quitar
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xl font-bold text-foreground">
              Total: {formatPrice(total)}
            </p>
            <Link
              href="/checkout"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90"
            >
              Continuar al checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
