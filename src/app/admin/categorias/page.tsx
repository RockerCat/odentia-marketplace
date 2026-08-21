import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FlashMessage from "../flash-message";
import { deleteCategoryAction } from "./actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps<"/admin/categorias">) {
  const { success, error } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <FlashMessage
        success={typeof success === "string" ? success : undefined}
        error={typeof error === "string" ? error : undefined}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
        <Link
          href="/admin/categorias/nueva"
          className="bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-800"
        >
          + Nueva categoría
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Productos</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-slate-400" colSpan={3}>
                  No hay categorías todavía.
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{category.name}</td>
                <td className="px-5 py-3 text-slate-500">{category._count.products}</td>
                <td className="px-5 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/categorias/${category.id}/editar`}
                    className="text-teal-700 hover:underline"
                  >
                    Editar
                  </Link>
                  <form action={deleteCategoryAction} className="inline">
                    <input type="hidden" name="id" value={category.id} />
                    <ConfirmSubmitButton
                      confirmMessage="¿Eliminar esta categoría?"
                      className="text-red-500 hover:underline"
                    >
                      Eliminar
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
