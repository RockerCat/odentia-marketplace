import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getProductImageUrl } from "@/lib/supabase";

export default async function CatalogPage({
  searchParams,
}: PageProps<"/">) {
  const { category } = await searchParams;
  const activeCategory = typeof category === "string" ? category : undefined;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: activeCategory ? { category: { slug: activeCategory } } : {},
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Implementos odontológicos
        </h1>
        <p className="text-slate-500 mt-1">
          Todo lo que tu consultorio necesita, en un solo lugar.
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="w-48 shrink-0">
          <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">
            Categorías
          </h2>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md ${
                  !activeCategory
                    ? "bg-teal-700 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                Todas
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/?category=${cat.slug}`}
                  className={`block px-3 py-2 rounded-md ${
                    activeCategory === cat.slug
                      ? "bg-teal-700 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 && (
            <p className="text-slate-500 col-span-full">
              No hay productos en esta categoría.
            </p>
          )}

          {products.map((product) => (
            <Link
              key={product.id}
              href={`/productos/${product.slug}`}
              className="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                {product.images[0] ? (
                  <Image
                    src={getProductImageUrl(product.images[0].path)}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-slate-300 text-sm">Sin imagen</span>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wide text-teal-700 font-semibold mb-1">
                  {product.category.name}
                </p>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-slate-900">
                  {formatPrice(product.priceCents)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {product.stock} disponibles
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
