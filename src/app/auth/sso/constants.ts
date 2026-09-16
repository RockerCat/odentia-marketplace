import "server-only";

// Shared by both start/route.ts and callback/route.ts. STATE_COOKIE_NAME
// and CALLBACK_PATH in particular must agree exactly between the two — the
// state cookie is scoped to CALLBACK_PATH, so if the two files ever
// disagreed on that path, the callback would never see the cookie the
// start route set.
export const STATE_COOKIE_NAME = "odentia_sso_state";
export const CALLBACK_PATH = "/auth/sso/callback";
export const STATE_COOKIE_TTL_SECONDS = 5 * 60;
export const EXCHANGE_TIMEOUT_MS = 8000;

// Fixed, safe landing spot for every failure path, and for a successful
// login with no (or an invalid/expired) return-to intent. Never built from
// request input — always this literal.
export const SAFE_REDIRECT_PATH = "/";

// Checkpoint B: a second, Marketplace-owned cookie that carries ONLY a
// return-to intent through the SSO round trip — completely separate from
// STATE_COOKIE_NAME (the anti-CSRF nonce) and never involved in validating
// state/code/identity. Mirrors the state cookie's exact lifecycle
// (same CALLBACK_PATH, same TTL, single-use) on purpose: same security
// posture, same set of concerns already reasoned about for that cookie.
// V1 supports exactly one destination — deliberately a single literal, not
// an extensible allowlist, since nothing else is needed yet.
export const RETURN_TO_COOKIE_NAME = "odentia_sso_return_to";
export const CART_RETURN_TO_PATH = "/carrito";
