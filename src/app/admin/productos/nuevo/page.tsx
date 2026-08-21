import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProductAction } from "../actions";

const FILE_INPUT_CLASS =
  "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-700 file:text-white file:font-medium file:cursor-pointer hover:file:bg-teal-800";

export default async function NewProductPage({
  searchParams,
}: PageProps<"/admin/productos/nuevo">) {
  const errors = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-teal-700 hover:underline">
        &larr; Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">Nuevo producto</h1>

      <form
        action={createProductAction}
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-xl space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input type="text" name="name" className="w-full rounded-md border-slate-300" />
          {typeof errors.name === "string" && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select name="categoryId" className="w-full rounded-md border-slate-300">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {typeof errors.categoryId === "string" && (
            <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea name="description" rows={3} className="w-full rounded-md border-slate-300" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Precio (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              className="w-full rounded-md border-slate-300"
            />
            {typeof errors.price === "string" && (
              <p className="text-sm text-red-600 mt-1">{errors.price}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
            <input type="number" min="0" name="stock" className="w-full rounded-md border-slate-300" />
            {typeof errors.stock === "string" && (
              <p className="text-sm text-red-600 mt-1">{errors.stock}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Imágenes</label>
          <input type="file" name="images" multiple accept="image/*" className={FILE_INPUT_CLASS} />
          <p className="text-xs text-slate-400 mt-1">
            Puedes seleccionar una o varias imágenes (JPG, PNG — máx. 4MB c/u).
          </p>
        </div>

        <button
          type="submit"
          className="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800"
        >
          Crear producto
        </button>
      </form>
    </div>
  );
}
