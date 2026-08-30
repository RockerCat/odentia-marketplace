import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@odentia.com" },
    update: {},
    create: {
      name: "Administrador Odentia",
      email: "admin@odentia.com",
      password: await bcrypt.hash("odentia2026", 10),
    },
  });

  const categories: Record<string, { name: string; price: number; stock: number }[]> = {
    Instrumental: [
      { name: "Espejo bucal N°5", price: 14000, stock: 200 },
      { name: "Pinza algodonera", price: 16800, stock: 150 },
      { name: "Explorador dental doble punta", price: 20000, stock: 180 },
      { name: "Cureta periodontal Gracey", price: 51600, stock: 90 },
    ],
    Consumibles: [
      { name: "Guantes de nitrilo (caja x100)", price: 35600, stock: 300 },
      { name: "Barbijos quirúrgicos (caja x50)", price: 26000, stock: 300 },
      { name: "Anestesia dental lidocaína (caja x50)", price: 88000, stock: 80 },
      { name: "Rollos de algodón dental (bolsa x100)", price: 12800, stock: 250 },
    ],
    Equipos: [
      { name: "Lámpara de fotocurado LED", price: 580000, stock: 15 },
      { name: "Autoclave 18L", price: 3560000, stock: 5 },
      { name: "Pieza de mano de alta velocidad", price: 840000, stock: 20 },
      { name: "Sillón dental completo", price: 12800000, stock: 3 },
    ],
  };

  for (const [categoryName, products] of Object.entries(categories)) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(categoryName) },
      update: {},
      create: { name: categoryName, slug: slugify(categoryName) },
    });

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: slugify(product.name) },
        update: {},
        create: {
          categoryId: category.id,
          name: product.name,
          slug: slugify(product.name),
          description: `Implemento odontológico de la categoría ${categoryName}.`,
          priceCents: Math.round(product.price * 100),
          stock: product.stock,
        },
      });
    }
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
