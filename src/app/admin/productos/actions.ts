"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { slugify } from "@/lib/format";
import { uploadProductImage, deleteProductImage, InvalidImageError } from "@/lib/supabase";

function parseOptions(raw: string): string[] {
  return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];
}

async function syncProductOptions(productId: string, labels: string[]) {
  await prisma.productOption.deleteMany({ where: { productId } });
  if (labels.length === 0) return;

  await prisma.productOption.createMany({
    data: labels.map((label, i) => ({ productId, label, sortOrder: i })),
  });
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const distributor = String(formData.get("distributor") ?? "").trim();
  const costPriceRaw = String(formData.get("costPrice") ?? "").trim();
  const marginPercentRaw = String(formData.get("marginPercent") ?? "").trim();
  const costPrice = costPriceRaw ? Number(costPriceRaw) : null;
  const marginPercent = marginPercentRaw ? Number(marginPercentRaw) : null;
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  const errors: Record<string, string> = {};
  if (!name) errors.name = "El nombre es obligatorio.";
  if (!categoryId) errors.categoryId = "Selecciona una categoría.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Precio inválido.";
  if (!Number.isFinite(stock) || stock < 0) errors.stock = "Stock inválido.";
  if (costPriceRaw && (costPrice === null || !Number.isFinite(costPrice) || costPrice < 0)) {
    errors.costPrice = "Precio de costo inválido.";
  }
  if (marginPercentRaw && (marginPercent === null || !Number.isFinite(marginPercent) || marginPercent < 0)) {
    errors.marginPercent = "Margen inválido.";
  }

  return {
    errors,
    data: {
      name,
      categoryId,
      description: description || null,
      brand: brand || null,
      distributor: distributor || null,
      costPriceCents:
        costPrice !== null && Number.isFinite(costPrice) ? Math.round(costPrice) : null,
      marginPercent:
        marginPercent !== null && Number.isFinite(marginPercent) ? marginPercent : null,
      priceCents: Math.round(price),
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

  await syncProductOptions(product.id, parseOptions(String(formData.get("options") ?? "")));

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  let sortOrder = 0;
  try {
    for (const file of files) {
      const path = await uploadProductImage(file, product.id);
      await prisma.productImage.create({
        data: { productId: product.id, path, sortOrder: sortOrder++ },
      });
    }
  } catch (err) {
    if (err instanceof InvalidImageError) {
      redirect(`/admin/productos/${product.id}/editar?error=${encodeURIComponent(err.message)}`);
    }
    throw err;
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

  await syncProductOptions(id, parseOptions(String(formData.get("options") ?? "")));

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

  try {
    for (const file of files) {
      const path = await uploadProductImage(file, productId);
      await prisma.productImage.create({ data: { productId, path, sortOrder: sortOrder++ } });
    }
  } catch (err) {
    if (err instanceof InvalidImageError) {
      redirect(`/admin/productos/${productId}/editar?error=${encodeURIComponent(err.message)}`);
    }
    throw err;
  }

  redirect(`/admin/productos/${productId}/editar?success=Imagen agregada.`);
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let attempt = 1;

  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }

  return candidate;
}

export type ImportRow = {
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  options?: string[];
};

export async function createProductsFromImportAction(rows: ImportRow[]) {
  await verifySession();

  let created = 0;

  for (const row of rows) {
    const name = row.name.trim();
    if (!name || !row.categoryId) continue;
    if (!Number.isFinite(row.price) || row.price < 0) continue;
    if (!Number.isFinite(row.stock) || row.stock < 0) continue;

    const category = await prisma.category.findUnique({ where: { id: row.categoryId } });
    if (!category) continue;

    const product = await prisma.product.create({
      data: {
        categoryId: row.categoryId,
        name,
        slug: await uniqueSlug(name),
        priceCents: Math.round(row.price),
        stock: Math.round(row.stock),
      },
    });

    const options = [...new Set((row.options ?? []).map((o) => o.trim()).filter(Boolean))];
    if (options.length > 0) {
      await prisma.productOption.createMany({
        data: options.map((label, i) => ({ productId: product.id, label, sortOrder: i })),
      });
    }

    created += 1;
  }

  return { created };
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
