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
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-800"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3"></th>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3">Precio</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-slate-400" colSpan={6}>
                  No hay productos todavía.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center relative">
                    {product.images[0] ? (
                      <Image
                        src={getProductImageUrl(product.images[0].path)}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-slate-900">{product.name}</td>
                <td className="px-5 py-3 text-slate-500">{product.category.name}</td>
                <td className="px-5 py-3">{formatPrice(product.priceCents)}</td>
                <td className="px-5 py-3">{product.stock}</td>
                <td className="px-5 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/productos/${product.id}/editar`}
                    className="text-teal-700 hover:underline"
                  >
                    Editar
                  </Link>
                  <form action={deleteProductAction} className="inline">
                    <input type="hidden" name="id" value={product.id} />
                    <ConfirmSubmitButton
                      confirmMessage="¿Eliminar este producto?"
                      className="text-red-500 hover:underline"
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
