import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getProductImageUrl } from "@/lib/supabase";
import SearchBar from "./search-bar";

const PAGE_SIZE = 9;

export default async function CatalogPage({
  searchParams,
}: PageProps<"/">) {
  const { category, q, page } = await searchParams;
  const activeCategory = typeof category === "string" ? category : undefined;
  const query = typeof q === "string" ? q.trim() : "";
  const currentPage = Math.max(1, Number(page) || 1);

  const where = {
    ...(activeCategory ? { category: { slug: activeCategory } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [categories, totalProducts, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { name: "asc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (query) params.set("q", query);
    if (targetPage > 1) params.set("page", String(targetPage));
    const search = params.toString();
    return search ? `/?${search}` : "/";
  }

  return (
    <div>
      <div className="hidden sm:block relative w-full aspect-[18/5] -mt-4 mb-3 rounded-xl overflow-hidden">
        <Image
          src="/branding/banner-lopadent.png"
          alt="Lopadent — Suministros odontológicos"
          fill
          priority
          className="object-cover object-top"
        />
      </div>
      <div className="sm:hidden relative w-full aspect-[1983/793] -mt-4 mb-3 rounded-xl overflow-hidden">
        <Image
          src="/branding/banner-lopadent-mobile.png"
          alt="Lopadent — Suministros odontológicos"
          fill
          priority
          className="object-cover object-top"
        />
      </div>

      <SearchBar initialQuery={query} category={activeCategory} />

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <aside className="md:w-48 md:shrink-0">
          <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">
            Categorías
          </h2>
          <ul className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:flex-col md:gap-1 md:overflow-visible text-sm">
            <li className="shrink-0">
              <Link
                href={query ? `/?q=${encodeURIComponent(query)}` : "/"}
                className={`block px-3 py-2 rounded-full md:rounded-md whitespace-nowrap ${
                  !activeCategory
                    ? "bg-teal-700 text-white"
                    : "bg-slate-100 md:bg-transparent hover:bg-slate-200 md:hover:bg-slate-100"
                }`}
              >
                Todas
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id} className="shrink-0">
                <Link
                  href={`/?category=${cat.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`block px-3 py-2 rounded-full md:rounded-md whitespace-nowrap ${
                    activeCategory === cat.slug
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 md:bg-transparent hover:bg-slate-200 md:hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.length === 0 && (
              <p className="text-slate-500 col-span-full">
                {query
                  ? `No encontramos productos para "${query}".`
                  : "No hay productos en esta categoría."}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              {currentPage > 1 ? (
                <Link
                  href={pageHref(currentPage - 1)}
                  className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50"
                >
                  &larr; Anterior
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-300">
                  &larr; Anterior
                </span>
              )}

              <span className="text-sm text-slate-500">
                Página {currentPage} de {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={pageHref(currentPage + 1)}
                  className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50"
                >
                  Siguiente &rarr;
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-300">
                  Siguiente &rarr;
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
