import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getProductImageUrl } from "@/lib/supabase";
import FlashMessage from "../../../flash-message";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import { updateProductAction, deleteProductImageAction } from "../../actions";
import QuickImageUpload from "./quick-image-upload";

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/productos/[id]/editar">) {
  const { id } = await params;
  const errors = await searchParams;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-teal-700 hover:underline">
        &larr; Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">Editar producto</h1>

      <div className="mb-4">
        <FlashMessage
          success={typeof errors.success === "string" ? errors.success : undefined}
          error={typeof errors.error === "string" ? errors.error : undefined}
        />
      </div>

      <form
        action={updateProductAction}
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-xl space-y-4"
      >
        <input type="hidden" name="id" value={product.id} />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            defaultValue={product.name}
            className="w-full rounded-md border-slate-300"
          />
          {typeof errors.name === "string" && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select
            name="categoryId"
            defaultValue={product.categoryId}
            className="w-full rounded-md border-slate-300"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={product.description ?? ""}
            className="w-full rounded-md border-slate-300"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Precio (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              defaultValue={(product.priceCents / 100).toFixed(2)}
              className="w-full rounded-md border-slate-300"
            />
            {typeof errors.price === "string" && (
              <p className="text-sm text-red-600 mt-1">{errors.price}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
            <input
              type="number"
              min="0"
              name="stock"
              defaultValue={product.stock}
              className="w-full rounded-md border-slate-300"
            />
            {typeof errors.stock === "string" && (
              <p className="text-sm text-red-600 mt-1">{errors.stock}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800"
        >
          Guardar cambios
        </button>
      </form>

      <div className="max-w-xl mt-6">
        <h2 className="text-sm font-medium text-slate-700 mb-3">Imágenes</h2>

        {product.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {product.images.map((image) => (
              <div key={image.id} className="relative group aspect-square">
                <Image
                  src={getProductImageUrl(image.path)}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg border border-slate-200"
                />
                <form
                  action={deleteProductImageAction}
                  className="absolute top-1 right-1"
                >
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <ConfirmSubmitButton
                    confirmMessage="¿Eliminar esta imagen?"
                    className="bg-white/90 text-red-600 text-xs rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-white"
                  >
                    &times;
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}

        <QuickImageUpload productId={product.id} />
      </div>
    </div>
  );
}
