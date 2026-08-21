"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Pedidos", match: (p: string) => p === "/admin" || p.startsWith("/admin/pedidos") },
  { href: "/admin/productos", label: "Productos", match: (p: string) => p.startsWith("/admin/productos") },
  { href: "/admin/categorias", label: "Categorías", match: (p: string) => p.startsWith("/admin/categorias") },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-1 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`block px-3 py-2 rounded-md ${
            link.match(pathname) ? "bg-slate-800 text-white" : "hover:bg-slate-800"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
