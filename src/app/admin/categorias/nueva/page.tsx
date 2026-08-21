import Link from "next/link";
import { createCategoryAction } from "../actions";
import FlashMessage from "../../flash-message";

export default async function NewCategoryPage({
  searchParams,
}: PageProps<"/admin/categorias/nueva">) {
  const { error } = await searchParams;

  return (
    <div>
      <Link href="/admin/categorias" className="text-sm text-teal-700 hover:underline">
        &larr; Volver a categorías
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">Nueva categoría</h1>

      <FlashMessage error={typeof error === "string" ? error : undefined} />

      <form
        action={createCategoryAction}
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-md space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input type="text" name="name" className="w-full rounded-md border-slate-300" />
        </div>

        <button
          type="submit"
          className="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800"
        >
          Crear categoría
        </button>
      </form>
    </div>
  );
}
