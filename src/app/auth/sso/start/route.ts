import "server-only";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { CALLBACK_PATH, SAFE_REDIRECT_PATH, STATE_COOKIE_NAME, STATE_COOKIE_TTL_SECONDS } from "../constants";

// Starts the Core -> Marketplace SSO handshake: mints a random anti-CSRF
// `state`, stores it in a short-lived cookie scoped to the callback path
// only, and redirects the browser to Core's configured SSO entry point.
// Core's own entry point (SSO E) doesn't exist yet — ODENTIA_CORE_SSO_URL
// is the one place that knows its real address once it does, so this route
// never hardcodes a guessed Core path.
export async function GET(request: NextRequest) {
  const coreSsoUrl = process.env.ODENTIA_CORE_SSO_URL;
  const marketplaceUrl = process.env.MARKETPLACE_URL;

  if (!coreSsoUrl || !marketplaceUrl) {
    return NextResponse.redirect(new URL(SAFE_REDIRECT_PATH, request.url));
  }

  // Validate configuration BEFORE minting any state — a malformed env value
  // should never leave a dangling, never-consumed state cookie behind.
  let target: URL;
  let redirectUri: string;
  try {
    target = new URL(coreSsoUrl);
    redirectUri = new URL(CALLBACK_PATH, marketplaceUrl).toString();
  } catch {
    return NextResponse.redirect(new URL(SAFE_REDIRECT_PATH, request.url));
  }

  // 32 bytes of crypto-random entropy, URL-safe, never derived from
  // email/user/clinic/time — a plain opaque anti-CSRF nonce.
  const state = randomBytes(32).toString("base64url");

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: CALLBACK_PATH,
    maxAge: STATE_COOKIE_TTL_SECONDS,
  });

  target.searchParams.set("state", state);
  // Marketplace's OWN canonical callback URL, built from server-side
  // config only — never something the browser could redirect Core toward.
  target.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(target);
}
