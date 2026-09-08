import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "odentia_cart";

// Keyed by "productId" or "productId::optionLabel" so a product with several
// options (e.g. "Copa" and "Disco") can sit in the cart as separate lines.
type RawCart = Record<string, number>;

function makeKey(productId: string, option?: string | null) {
  return option ? `${productId}::${option}` : productId;
}

function splitKey(key: string): { productId: string; option: string | null } {
  const separatorIndex = key.indexOf("::");
  if (separatorIndex === -1) return { productId: key, option: null };
  return { productId: key.slice(0, separatorIndex), option: key.slice(separatorIndex + 2) };
}

async function readCart(): Promise<RawCart> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return {};

  try {
    return JSON.parse(raw) as RawCart;
  } catch {
    return {};
  }
}

async function writeCart(cart: RawCart) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function addToCart(productId: string, quantity: number, option?: string | null) {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
  });

  const key = makeKey(productId, option);
  const cart = await readCart();
  const current = cart[key] ?? 0;
  cart[key] = Math.min(product.stock, Math.max(1, current + quantity));

  await writeCart(cart);
}

export async function updateCartItem(key: string, quantity: number) {
  const cart = await readCart();
  const { productId } = splitKey(key);

  if (quantity <= 0) {
    delete cart[key];
  } else {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    cart[key] = Math.min(product.stock, quantity);
  }

  await writeCart(cart);
}

export async function removeFromCart(key: string) {
  const cart = await readCart();
  delete cart[key];
  await writeCart(cart);
}

export async function clearCart() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCartItems() {
  const cart = await readCart();
  const keys = Object.keys(cart);
  if (keys.length === 0) return [];

  const productIds = [...new Set(keys.map((key) => splitKey(key).productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  const productsById = new Map(products.map((p) => [p.id, p]));

  return keys
    .map((key) => {
      const { productId, option } = splitKey(key);
      const product = productsById.get(productId);
      if (!product) return null;

      const quantity = cart[key];
      return {
        key,
        product,
        option,
        quantity,
        subtotalCents: product.priceCents * quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function getCartCount() {
  const cart = await readCart();
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

export async function getCartTotalCents() {
  const items = await getCartItems();
  return items.reduce((sum, item) => sum + item.subtotalCents, 0);
}
