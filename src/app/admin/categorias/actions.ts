"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { slugify } from "@/lib/format";

export async function createCategoryAction(formData: FormData) {
  await verifySession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect("/admin/categorias/nueva?error=El nombre es obligatorio.");
  }

  await prisma.category.create({ data: { name, slug: slugify(name) } });

  redirect("/admin/categorias?success=Categoría creada.");
}

export async function updateCategoryAction(formData: FormData) {
  await verifySession();

  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect(`/admin/categorias/${id}/editar?error=El nombre es obligatorio.`);
  }

  await prisma.category.update({
    where: { id },
    data: { name, slug: slugify(name) },
  });

  redirect("/admin/categorias?success=Categoría actualizada.");
}

export async function deleteCategoryAction(formData: FormData) {
  await verifySession();

  const id = String(formData.get("id"));

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    redirect("/admin/categorias?error=No se puede eliminar: tiene productos asociados.");
  }

  await prisma.category.delete({ where: { id } });

  redirect("/admin/categorias?success=Categoría eliminada.");
}
