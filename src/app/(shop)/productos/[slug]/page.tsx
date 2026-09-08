import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getProductImageUrl } from "@/lib/supabase";
import { addToCartAction } from "../../carrito/actions";
import ProductGallery from "./product-gallery";

export default async function ProductPage({
  params,
}: PageProps<"/productos/[slug]">) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      options: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  const imageUrls = product.images.map((img) => getProductImageUrl(img.path));

  return (
    <div>
      <Link href="/" className="text-sm text-teal-700 hover:underline">
        &larr; Volver al catálogo
      </Link>

      <div className="mt-6 flex flex-col lg:flex-row gap-8 max-w-4xl">
        <ProductGallery images={imageUrls} alt={product.name} />

        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-xs uppercase tracking-wide text-teal-700 font-semibold mb-2">
            {product.category.name}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            {product.name}
          </h1>
          <p className="text-slate-600 mb-6">{product.description}</p>

          <div className="border-t border-slate-100 pt-6">
            <div className="mb-4">
              <p className="text-3xl font-bold text-slate-900">
                {formatPrice(product.priceCents)}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {product.stock} disponibles
              </p>
            </div>

            {product.stock > 0 ? (
              <form action={addToCartAction} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="productId" value={product.id} />

                {product.options.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Opción
                    </label>
                    <select
                      name="option"
                      required
                      className="rounded-md border-slate-300"
                    >
                      {product.options.map((opt) => (
                        <option key={opt.id} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    defaultValue={1}
                    min={1}
                    max={product.stock}
                    className="w-20 rounded-md border-slate-300 text-center"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800"
                >
                  Agregar al carrito
                </button>
              </form>
            ) : (
              <span className="text-red-600 font-medium">Sin stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
