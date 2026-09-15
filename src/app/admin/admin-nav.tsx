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
    <nav className="flex-1 px-3 py-6 space-y-1 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors ${
            link.match(pathname)
              ? "bg-primary/10 font-medium text-primary"
              : "text-foreground/80 hover:bg-foreground/5"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
