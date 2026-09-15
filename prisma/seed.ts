import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const MIN_SEED_ADMIN_PASSWORD_LENGTH = 12;

// No default/fallback credentials on purpose — a predictable admin
// email+password baked into the repo (as this file and README.md both had
// until this fix) is a real credential exposure. The admin identity must
// come from the environment of whoever runs the seed, never from source.
function readSeedAdminConfig(): { email: string; password: string } {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required to run the admin seed.");
  }

  if (password.length < MIN_SEED_ADMIN_PASSWORD_LENGTH) {
    throw new Error(`SEED_ADMIN_PASSWORD must be at least ${MIN_SEED_ADMIN_PASSWORD_LENGTH} characters long.`);
  }

  return { email, password };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const { email: adminEmail, password: adminPassword } = readSeedAdminConfig();

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador Odentia",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
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
          priceCents: Math.round(product.price),
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
