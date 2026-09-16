import Link from "next/link";
import Image from "next/image";
import { getCartCount } from "@/lib/cart";
import { getCustomerSession } from "@/lib/customer-session";

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

  // Same derivation Core's own authenticated header uses (see
  // use-shell-identity.ts): "firstName lastName" trimmed, and initials as
  // the first letter of each, uppercased.
  const displayName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : null;
  const initials = customer ? `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase() : null;

  return (
    <>
      <header className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <a href="https://odentia-core.vercel.app/agenda">
              <Image
                src="/branding/odentia.png"
                alt="Odentia"
                width={124}
                height={37}
                priority
                className="h-6 sm:h-8 w-auto shrink-0"
              />
            </a>
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

            {customer ? (
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                >
                  {initials}
                </span>
                <span className="hidden sm:block text-left leading-tight">
                  <span className="block text-foreground">{displayName}</span>
                  <span className="block text-xs text-muted-foreground">{customer.clinicName}</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <a href={CORE_LOGIN_URL} className="hover:text-teal-700">
                  Iniciar sesión
                </a>
                <a href={CORE_REGISTER_URL} className="hidden sm:inline hover:text-teal-700">
                  Registra tu clínica
                </a>
              </div>
            )}

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
