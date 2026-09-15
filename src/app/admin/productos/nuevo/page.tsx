import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProductAction } from "../actions";

const FILE_INPUT_CLASS =
  "block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer hover:file:opacity-90";

export default async function NewProductPage({
  searchParams,
}: PageProps<"/admin/productos/nuevo">) {
  const errors = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-primary hover:underline">
        &larr; Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-foreground mt-4 mb-6">Nuevo producto</h1>

      <form
        action={createProductAction}
        className="bg-background rounded-xl border border-border p-6 max-w-xl space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-1">
            Nombre
          </label>
          <input type="text" id="name" name="name" className="w-full" />
          {typeof errors.name === "string" && (
            <p className="text-sm text-danger mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-foreground/80 mb-1">
            Categoría
          </label>
          <select id="categoryId" name="categoryId" className="w-full">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {typeof errors.categoryId === "string" && (
            <p className="text-sm text-danger mt-1">{errors.categoryId}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground/80 mb-1">
            Descripción
          </label>
          <textarea id="description" name="description" rows={3} className="w-full" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="price" className="block text-sm font-medium text-foreground/80 mb-1">
              Precio (COP)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              id="price"
              name="price"
              placeholder="Ej. 45000"
              className="w-full"
            />
            {typeof errors.price === "string" && (
              <p className="text-sm text-danger mt-1">{errors.price}</p>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="stock" className="block text-sm font-medium text-foreground/80 mb-1">
              Stock
            </label>
            <input type="number" min="0" id="stock" name="stock" className="w-full" />
            {typeof errors.stock === "string" && (
              <p className="text-sm text-danger mt-1">{errors.stock}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="options" className="block text-sm font-medium text-foreground/80 mb-1">
            Opciones (opcional)
          </label>
          <input
            type="text"
            id="options"
            name="options"
            placeholder="Ninguno"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separadas por coma. El cliente elige una al agregar al carrito; el precio y el stock
            son los mismos para todas.
          </p>
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-foreground/80 mb-1">
            Imágenes
          </label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className={FILE_INPUT_CLASS}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Puedes seleccionar una o varias imágenes (JPG, PNG o WebP — máx. 5MB c/u).
          </p>
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
        >
          Crear producto
        </button>
      </form>
    </div>
  );
}
