import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "odentia_cart";

// Same production signal already used for `secure` below.
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Shared Cart Checkpoint A: in Production this cookie is domain-shared
// with Core (see SHARED_CART_DOMAIN) so Core's header can read the same
// real cart server-side. Deliberately NOT gated on IS_PRODUCTION/NODE_ENV
// above — Vercel Preview deployments also run with NODE_ENV=production,
// but they're served from *.vercel.app, where a Domain=.odentia.co
// attribute doesn't match the actual response host at all. A browser
// rejects the ENTIRE Set-Cookie header when that happens, which would
// break the cart outright on every Preview deployment, not just fail to
// share it. VERCEL_ENV is the standard, platform-injected variable Vercel
// itself sets to exactly "production" | "preview" | "development" — no
// custom env var needed — so this is the one condition precise enough to
// only ever fire on the real marketplace.odentia.co deployment. Local dev
// has no VERCEL_ENV at all, so it falls through to host-only exactly like
// Preview does.
const SHOULD_SHARE_CART_DOMAIN = process.env.VERCEL_ENV === "production";
const SHARED_CART_DOMAIN = ".odentia.co";

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
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    ...(SHOULD_SHARE_CART_DOMAIN ? { domain: SHARED_CART_DOMAIN } : {}),
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
  // Must target the exact same scope writeCart() used to set it (same
  // SHOULD_SHARE_CART_DOMAIN condition), or this would leave the real
  // (domain-shared) cookie in place while only ever clearing a host-only
  // cookie that was never actually set — the stale-cookie bug flagged
  // during the cart audit.
  if (SHOULD_SHARE_CART_DOMAIN) {
    cookieStore.delete({ name: COOKIE_NAME, path: "/", domain: SHARED_CART_DOMAIN });
  } else {
    cookieStore.delete(COOKIE_NAME);
  }
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
