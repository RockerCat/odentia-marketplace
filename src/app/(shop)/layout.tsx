import Link from "next/link";
import { getCartCount } from "@/lib/cart";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const cartCount = await getCartCount();

  return (
    <>
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal-700">
            Odentia
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-teal-700">
              Catálogo
            </Link>
            <Link href="/carrito" className="hover:text-teal-700">
              Carrito
              {cartCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-teal-700 text-white text-xs w-5 h-5">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Odentia — Implementos
        odontológicos.
      </footer>
    </>
  );
}
