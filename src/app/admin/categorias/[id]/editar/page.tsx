import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateCategoryAction } from "../../actions";
import FlashMessage from "../../../flash-message";

export default async function EditCategoryPage({
  params,
  searchParams,
}: PageProps<"/admin/categorias/[id]/editar">) {
  const { id } = await params;
  const { error } = await searchParams;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <Link href="/admin/categorias" className="text-sm text-primary hover:underline">
        &larr; Volver a categorías
      </Link>

      <h1 className="text-2xl font-bold text-foreground mt-4 mb-6">Editar categoría</h1>

      <FlashMessage error={typeof error === "string" ? error : undefined} />

      <form
        action={updateCategoryAction}
        className="bg-background rounded-xl border border-border p-6 max-w-md space-y-4"
      >
        <input type="hidden" name="id" value={category.id} />

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-1">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={category.name}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
