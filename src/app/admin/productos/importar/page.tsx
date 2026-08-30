import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ImportPdfClient from "./import-client";

export default async function ImportProductsPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-teal-700 hover:underline">
        &larr; Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Importar productos desde PDF</h1>
      <p className="text-sm text-slate-500 mb-6">
        Sube un PDF (lista de precios, catálogo, etc.). El sistema intenta detectar productos y
        precios automáticamente — revisa y corrige la tabla antes de crear los productos, porque
        la detección no siempre es perfecta.
      </p>

      <ImportPdfClient categories={categories} />
    </div>
  );
}
