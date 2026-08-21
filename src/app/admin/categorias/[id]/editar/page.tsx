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
      <Link href="/admin/categorias" className="text-sm text-teal-700 hover:underline">
        &larr; Volver a categorías
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">Editar categoría</h1>

      <FlashMessage error={typeof error === "string" ? error : undefined} />

      <form
        action={updateCategoryAction}
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-md space-y-4"
      >
        <input type="hidden" name="id" value={category.id} />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            defaultValue={category.name}
            className="w-full rounded-md border-slate-300"
          />
        </div>

        <button
          type="submit"
          className="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
