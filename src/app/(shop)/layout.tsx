import Link from "next/link";
import Image from "next/image";
import { getCartCount } from "@/lib/cart";
import { getCustomerSession } from "@/lib/customer-session";
import { CustomerIdentityMenu } from "./customer-identity-menu";

// Canonical Core destinations for a guest customer — Core remains the only
// authority for authentication/registration; Marketplace never implements
// its own customer login/signup. No `return_to`/`next` param: Core doesn't
// support an automatic post-login return into Marketplace yet (see the
// Marketplace header/customer identity audit) — that's explicitly out of
// scope here, not an oversight.
const CORE_LOGIN_URL = "https://www.odentia.co/login";
const CORE_REGISTER_URL = "https://www.odentia.co/registro";

// Same SVG geometry/stroke language as the ShoppingCartIcon already
// approved in odentia-core's src/components/shell/icons.tsx — replicated
// here (not imported/shared) since Core and Marketplace are separate
// repos/deployments; this is a small, self-contained icon, not shared
// runtime code.
function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.2 11a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.5 8H6.5" />
    </svg>
  );
}

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  // Independent reads — resolved in parallel rather than a sequential
  // waterfall. getCustomerSession() already returns null for a
  // missing/expired/invalid odentia_customer_session (see src/lib/
  // customer-session.ts); no additional handling is needed for that here.
  const [cartCount, customer] = await Promise.all([getCartCount(), getCustomerSession()]);

  return (
    <>
      <header className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/">
              <Image
                src="/branding/odentia.png"
                alt="Odentia"
                width={124}
                height={37}
                priority
                className="h-6 sm:h-8 w-auto shrink-0"
              />
            </Link>
            <span className="h-5 sm:h-6 w-px bg-border shrink-0" />
            <Link href="/">
              <Image
                src="/branding/lopadent.png"
                alt="Lopadent"
                width={103}
                height={24}
                className="h-4 sm:h-5 w-auto shrink-0"
              />
            </Link>
          </div>
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium shrink-0">
            <Link href="/" className="hidden sm:inline hover:text-teal-700">
              Catálogo
            </Link>

            <Link
              href="/carrito"
              aria-label={cartCount > 0 ? `Carrito, ${cartCount} producto${cartCount === 1 ? "" : "s"}` : "Carrito"}
              className="relative flex size-9 items-center justify-center text-foreground/80 hover:text-teal-700"
            >
              <ShoppingCartIcon className="size-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-warning text-[10px] font-medium text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>

            {customer ? (
              <CustomerIdentityMenu
                firstName={customer.firstName}
                lastName={customer.lastName}
                clinicName={customer.clinicName}
              />
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <a
                  href={CORE_LOGIN_URL}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5 sm:border sm:border-border sm:px-4 sm:py-2 sm:text-sm"
                >
                  Soy cliente Odentia
                </a>
                <a
                  href={CORE_REGISTER_URL}
                  className="hidden rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 sm:inline-block sm:px-4 sm:py-2 sm:text-sm"
                >
                  Registra tu clínica
                </a>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Odentia — Implementos
        odontológicos.
      </footer>
    </>
  );
}
