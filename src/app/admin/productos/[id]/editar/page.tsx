import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getProductImageUrl } from "@/lib/supabase";
import FlashMessage from "../../../flash-message";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import { updateProductAction, deleteProductImageAction } from "../../actions";
import QuickImageUpload from "./quick-image-upload";
import PriceCalculator from "../../price-calculator";

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/productos/[id]/editar">) {
  const { id } = await params;
  const errors = await searchParams;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        options: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-primary hover:underline">
        &larr; Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-foreground mt-4 mb-6">Editar producto</h1>

      <div className="mb-4">
        <FlashMessage
          success={typeof errors.success === "string" ? errors.success : undefined}
          error={typeof errors.error === "string" ? errors.error : undefined}
        />
      </div>

      <form
        action={updateProductAction}
        className="bg-background rounded-xl border border-border p-8 max-w-3xl space-y-4"
      >
        <input type="hidden" name="id" value={product.id} />

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-1">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={product.name}
            className="w-full"
          />
          {typeof errors.name === "string" && (
            <p className="text-sm text-danger mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-foreground/80 mb-1">
            Categoría
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product.categoryId}
            className="w-full"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground/80 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product.description ?? ""}
            className="w-full"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="brand" className="block text-sm font-medium text-foreground/80 mb-1">
              Marca (opcional)
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              defaultValue={product.brand ?? ""}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="distributor" className="block text-sm font-medium text-foreground/80 mb-1">
              Distribuidor (opcional)
            </label>
            <input
              type="text"
              id="distributor"
              name="distributor"
              defaultValue={product.distributor ?? ""}
              className="w-full"
            />
          </div>
        </div>

        <PriceCalculator
          defaultCostPriceCents={product.costPriceCents ?? product.priceCents}
          defaultMarginPercent={product.marginPercent}
          defaultPriceCents={product.priceCents}
          costError={typeof errors.costPrice === "string" ? errors.costPrice : undefined}
          marginError={typeof errors.marginPercent === "string" ? errors.marginPercent : undefined}
          priceError={typeof errors.price === "string" ? errors.price : undefined}
        />

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-foreground/80 mb-1">
            Stock
          </label>
          <input
            type="number"
            min="0"
            id="stock"
            name="stock"
            defaultValue={product.stock}
            className="w-full max-w-xs"
          />
          {typeof errors.stock === "string" && (
            <p className="text-sm text-danger mt-1">{errors.stock}</p>
          )}
        </div>

        <div>
          <label htmlFor="options" className="block text-sm font-medium text-foreground/80 mb-1">
            Opciones (opcional)
          </label>
          <input
            type="text"
            id="options"
            name="options"
            defaultValue={product.options.map((o) => o.label).join(", ")}
            placeholder="Ninguno"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separadas por coma. El cliente elige una al agregar al carrito; el precio y el stock
            son los mismos para todas.
          </p>
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
        >
          Guardar cambios
        </button>
      </form>

      <div className="max-w-3xl mt-6">
        <h2 className="text-sm font-medium text-foreground/80 mb-3">Imágenes</h2>

        {product.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {product.images.map((image) => (
              <div key={image.id} className="relative group aspect-square">
                <Image
                  src={getProductImageUrl(image.path)}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg border border-border"
                />
                <form
                  action={deleteProductImageAction}
                  className="absolute top-1 right-1"
                >
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <ConfirmSubmitButton
                    confirmMessage="¿Eliminar esta imagen?"
                    className="bg-background/90 text-danger text-xs rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-background"
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
