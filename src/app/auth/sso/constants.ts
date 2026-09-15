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

// Fixed, safe landing spot for every outcome of this flow — success and
// every failure path alike. No `next=`/return-URL parameter exists yet, so
// there is nothing here an open redirect could ever be built from.
export const SAFE_REDIRECT_PATH = "/";
