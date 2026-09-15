import Image from "next/image";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { logoutAction } from "./actions";
import AdminNav from "./admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await verifySession();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-background border-r border-border flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center justify-center border-b border-border px-4 py-8">
          <Image
            src="/branding/odentia.png"
            alt="Odentia"
            width={124}
            height={37}
            priority
            className="h-8 w-auto"
          />
        </div>
        <AdminNav />
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5"
          >
            Ver tienda
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-lg text-left px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-surface">{children}</main>
    </div>
  );
}
