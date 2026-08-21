"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { slugify } from "@/lib/format";
import { uploadProductImage, deleteProductImage } from "@/lib/supabase";

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  const errors: Record<string, string> = {};
  if (!name) errors.name = "El nombre es obligatorio.";
  if (!categoryId) errors.categoryId = "Selecciona una categoría.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Precio inválido.";
  if (!Number.isFinite(stock) || stock < 0) errors.stock = "Stock inválido.";

  return {
    errors,
    data: {
      name,
      categoryId,
      description: description || null,
      priceCents: Math.round(price * 100),
      stock,
    },
  };
}

export async function createProductAction(formData: FormData) {
  await verifySession();

  const { errors, data } = parseProductFields(formData);
  if (Object.keys(errors).length > 0) {
    const query = new URLSearchParams(errors).toString();
    redirect(`/admin/productos/nuevo?${query}`);
  }

  const product = await prisma.product.create({
    data: { ...data, slug: slugify(data.name) },
  });

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  let sortOrder = 0;
  for (const file of files) {
    const path = await uploadProductImage(file, product.id);
    await prisma.productImage.create({
      data: { productId: product.id, path, sortOrder: sortOrder++ },
    });
  }

  redirect("/admin/productos?success=Producto creado.");
}

export async function updateProductAction(formData: FormData) {
  await verifySession();

  const id = String(formData.get("id"));
  const { errors, data } = parseProductFields(formData);
  if (Object.keys(errors).length > 0) {
    const query = new URLSearchParams(errors).toString();
    redirect(`/admin/productos/${id}/editar?${query}`);
  }

  await prisma.product.update({
    where: { id },
    data: { ...data, slug: slugify(data.name) },
  });

  redirect("/admin/productos?success=Producto actualizado.");
}

export async function deleteProductAction(formData: FormData) {
  await verifySession();

  const id = String(formData.get("id"));

  const images = await prisma.productImage.findMany({ where: { productId: id } });
  for (const image of images) {
    await deleteProductImage(image.path);
  }

  await prisma.product.delete({ where: { id } });

  redirect("/admin/productos?success=Producto eliminado.");
}

export async function addProductImageAction(formData: FormData) {
  await verifySession();

  const productId = String(formData.get("productId"));
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    redirect(`/admin/productos/${productId}/editar?error=Selecciona al menos una imagen.`);
  }

  const currentMax = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  let sortOrder = (currentMax._max.sortOrder ?? -1) + 1;

  for (const file of files) {
    const path = await uploadProductImage(file, productId);
    await prisma.productImage.create({ data: { productId, path, sortOrder: sortOrder++ } });
  }

  redirect(`/admin/productos/${productId}/editar?success=Imagen agregada.`);
}

export async function deleteProductImageAction(formData: FormData) {
  await verifySession();

  const productId = String(formData.get("productId"));
  const imageId = String(formData.get("imageId"));

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (image && image.productId === productId) {
    await deleteProductImage(image.path);
    await prisma.productImage.delete({ where: { id: imageId } });
  }

  redirect(`/admin/productos/${productId}/editar?success=Imagen eliminada.`);
}
