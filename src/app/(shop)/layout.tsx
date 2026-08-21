import Link from "next/link";
import Image from "next/image";
import { getCartCount } from "@/lib/cart";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const cartCount = await getCartCount();

  return (
    <>
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Image
              src="/branding/odentia.png"
              alt="Odentia"
              width={124}
              height={37}
              priority
              className="h-6 sm:h-8 w-auto shrink-0"
            />
            <span className="h-5 sm:h-6 w-px bg-slate-200 shrink-0" />
            <Image
              src="/branding/lopadent.png"
              alt="Lopadent"
              width={103}
              height={24}
              className="h-4 sm:h-5 w-auto shrink-0"
            />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium shrink-0">
            <Link href="/" className="hidden sm:inline hover:text-teal-700">
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
