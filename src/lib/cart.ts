import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "odentia_cart";
type RawCart = Record<string, number>;

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

export async function addToCart(productId: string, quantity: number) {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
  });

  const cart = await readCart();
  const current = cart[productId] ?? 0;
  cart[productId] = Math.min(product.stock, Math.max(1, current + quantity));

  await writeCart(cart);
}

export async function updateCartItem(productId: string, quantity: number) {
  const cart = await readCart();

  if (quantity <= 0) {
    delete cart[productId];
  } else {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    cart[productId] = Math.min(product.stock, quantity);
  }

  await writeCart(cart);
}

export async function removeFromCart(productId: string) {
  const cart = await readCart();
  delete cart[productId];
  await writeCart(cart);
}

export async function clearCart() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCartItems() {
  const cart = await readCart();
  const ids = Object.keys(cart);
  if (ids.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return products.map((product) => ({
    product,
    quantity: cart[product.id],
    subtotalCents: product.priceCents * cart[product.id],
  }));
}

export async function getCartCount() {
  const cart = await readCart();
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

export async function getCartTotalCents() {
  const items = await getCartItems();
  return items.reduce((sum, item) => sum + item.subtotalCents, 0);
}
