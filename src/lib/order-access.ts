import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// An order's cuid is a database identifier, not a secret — this is what
// actually proves the browser reading /pedido/[id]/gracias is the one that
// placed (or, via an idempotency retry, re-requested) that specific order.
// No customer accounts exist yet, so this is the minimal guest-flow
// equivalent: a random per-order token, held only by that browser via an
// HttpOnly cookie scoped to that order's own confirmation path, verified
// server-side against a hash stored on the Order row. The raw token is
// never persisted — only its SHA-256 hash.

const TOKEN_BYTES = 32; // 256 bits of entropy.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h — long enough to revisit the confirmation shortly after purchase; this isn't a customer session.

function cookieNameFor(orderId: string): string {
  return `order_access_${orderId}`;
}

export function generateOrderAccessToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashOrderAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Issues (or re-issues) possession of `orderId`'s confirmation to the
// current browser. Called both right after creating a new Order and from
// every idempotency-retry/concurrent-race-recovery path that redirects to
// an existing one (see checkout/actions.ts) — each of those paths is only
// reachable by presenting the correct idempotencyKey in the first place, so
// re-issuing a fresh token there is granting access to the same legitimate
// browser, not a new party.
export async function grantOrderAccess(orderId: string, token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(cookieNameFor(orderId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/pedido/${orderId}/gracias`,
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

// `storedHash` is the Order's persisted accessTokenHash — null for an order
// that never got one (never created through this flow, or a historical
// order from before it existed). Such an order has no verifier to check
// against, so it can never pass here: it simply isn't publicly readable by
// ID alone anymore.
export async function verifyOrderAccess(orderId: string, storedHash: string | null): Promise<boolean> {
  if (!storedHash) return false;

  const cookieStore = await cookies();
  const presentedToken = cookieStore.get(cookieNameFor(orderId))?.value;
  if (!presentedToken) return false;

  const presentedHash = Buffer.from(hashOrderAccessToken(presentedToken), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");

  // Both sides are always a 32-byte sha256 digest when they come from
  // hashOrderAccessToken(), but storedHash is untrusted DB content read
  // back as a string — guard the length before timingSafeEqual, which
  // throws on a length mismatch instead of returning false.
  if (presentedHash.length !== expectedHash.length) return false;

  return timingSafeEqual(presentedHash, expectedHash);
}
