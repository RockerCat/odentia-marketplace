import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { logoutAction } from "./actions";
import AdminNav from "./admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await verifySession();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-5 text-lg font-bold text-white">Odentia Admin</div>
        <AdminNav />
        <div className="p-3 border-t border-slate-800">
          <Link href="/" className="block px-3 py-2 text-sm hover:text-white">
            Ver tienda
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="w-full text-left px-3 py-2 text-sm hover:text-white">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-slate-50">{children}</main>
    </div>
  );
}
