import "server-only";
import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createCustomerSession, isCustomerIdentity, type CustomerIdentity } from "@/lib/customer-session";
import {
  CALLBACK_PATH,
  CART_RETURN_TO_PATH,
  EXCHANGE_TIMEOUT_MS,
  RETURN_TO_COOKIE_NAME,
  SAFE_REDIRECT_PATH,
  STATE_COOKIE_NAME,
} from "../constants";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Guard the length before timingSafeEqual, which throws on a length
  // mismatch instead of returning false (same guard src/lib/order-
  // access.ts uses for its own token comparison).
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// isCustomerIdentity only proves the required fields are PRESENT with the
// right shape — it does not strip whatever extra fields Core's response
// might also carry. This rebuild is what actually keeps anything beyond
// the seven approved claims (PHI, billing, tokens, ...) out of the
// customer session JWT, regardless of what Core's exchange happens to
// return.
function toApprovedIdentity(identity: CustomerIdentity): CustomerIdentity {
  return {
    coreUserId: identity.coreUserId,
    clinicId: identity.clinicId,
    membershipId: identity.membershipId,
    role: identity.role,
    firstName: identity.firstName,
    lastName: identity.lastName,
    email: identity.email,
  };
}

function failClosed(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(SAFE_REDIRECT_PATH, request.url));
}

// Completes the Core -> Marketplace SSO handshake: validates the anti-CSRF
// state, exchanges the one-time code server-to-server against Core, and —
// only if Core certifies a well-formed identity — creates the Marketplace
// customer session via the existing SSO C helper (src/lib/customer-
// session.ts). Every failure path (missing/invalid state, exchange
// failure, malformed payload, session creation failure) redirects to the
// same safe path with no customer session created and no detail about
// which check failed — from the browser this always looks like the same
// generic "couldn't sign you in" outcome.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const presentedState = cookieStore.get(STATE_COOKIE_NAME)?.value;
  // Checkpoint B: read alongside state, but this value never participates
  // in any check below — it can only ever affect the final redirect AFTER
  // a fully successful SSO. Treated as untrusted browser input regardless
  // of the fact that Marketplace itself originally wrote it: it must be
  // re-validated against the exact same literal at the point of use.
  const presentedReturnTo = cookieStore.get(RETURN_TO_COOKIE_NAME)?.value;

  // Both consumed unconditionally on the very first callback request — a
  // replayed callback, whether it repeats the same state or not, must
  // never be able to succeed twice, and a stale return-to intent must
  // never survive to affect a later, unrelated attempt.
  cookieStore.delete({ name: STATE_COOKIE_NAME, path: CALLBACK_PATH });
  cookieStore.delete({ name: RETURN_TO_COOKIE_NAME, path: CALLBACK_PATH });

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state || !presentedState || !safeEqual(state, presentedState)) {
    return failClosed(request);
  }

  const coreUrl = process.env.ODENTIA_CORE_URL;
  const sharedSecret = process.env.MARKETPLACE_SSO_SHARED_SECRET;

  if (!coreUrl || !sharedSecret) {
    return failClosed(request);
  }

  let exchangeResponse: Response;
  try {
    exchangeResponse = await fetch(new URL("/api/sso/exchange", coreUrl), {
      method: "POST",
      headers: {
        // Server-only secret — never sent to, or readable by, the browser;
        // never appears in a query param.
        Authorization: `Bearer ${sharedSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
      cache: "no-store",
      signal: AbortSignal.timeout(EXCHANGE_TIMEOUT_MS),
    });
  } catch {
    // Network error, timeout, or DNS failure — never retried automatically
    // (a stale/consumed code must not be replayed against Core).
    return failClosed(request);
  }

  if (!exchangeResponse.ok) {
    return failClosed(request);
  }

  let payload: unknown;
  try {
    payload = await exchangeResponse.json();
  } catch {
    return failClosed(request);
  }

  if (!isCustomerIdentity(payload)) {
    return failClosed(request);
  }

  try {
    await createCustomerSession(toApprovedIdentity(payload));
  } catch {
    return failClosed(request);
  }

  // Only reached after state validation, exchange, payload validation, and
  // session creation ALL succeeded. Literal re-comparison, not a prefix or
  // path-parsing check — anything other than an exact match (missing,
  // expired, tampered, or any other value) falls back to the same safe
  // path every other outcome already uses.
  const destination = presentedReturnTo === CART_RETURN_TO_PATH ? CART_RETURN_TO_PATH : SAFE_REDIRECT_PATH;
  return NextResponse.redirect(new URL(destination, request.url));
}
