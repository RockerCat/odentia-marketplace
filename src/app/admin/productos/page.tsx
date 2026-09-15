import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getProductImageUrl } from "@/lib/supabase";
import FlashMessage from "../flash-message";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import { deleteProductAction } from "./actions";

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/productos">) {
  const { success, error } = await searchParams;

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div>
      <FlashMessage
        success={typeof success === "string" ? success : undefined}
        error={typeof error === "string" ? error : undefined}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Productos</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/productos/importar"
            className="bg-background border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/5"
          >
            Importar desde PDF
          </Link>
          <Link
            href="/admin/productos/nuevo"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            + Nuevo producto
          </Link>
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted-foreground text-left">
            <tr>
              <th className="px-5 py-3"></th>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3">Precio</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-muted-foreground" colSpan={6}>
                  No hay productos todavía.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-foreground/5">
                <td className="px-5 py-3">
                  <div className="w-10 h-10 rounded-lg bg-surface overflow-hidden flex items-center justify-center relative">
                    {product.images[0] ? (
                      <Image
                        src={getProductImageUrl(product.images[0].path)}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-foreground">{product.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{product.category.name}</td>
                <td className="px-5 py-3">{formatPrice(product.priceCents)}</td>
                <td className="px-5 py-3">{product.stock}</td>
                <td className="px-5 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/productos/${product.id}/editar`}
                    className="text-primary hover:underline"
                  >
                    Editar
                  </Link>
                  <form action={deleteProductAction} className="inline">
                    <input type="hidden" name="id" value={product.id} />
                    <ConfirmSubmitButton
                      confirmMessage="¿Eliminar este producto?"
                      className="text-danger hover:underline"
                    >
                      Eliminar
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
