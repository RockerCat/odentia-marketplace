import "server-only";
import { NextResponse } from "next/server";
import { deleteCustomerSession } from "@/lib/customer-session";

// Fixed literal, never accepted as input — this endpoint's only possible
// destination, by design (see the coordinated-logout audit's explicit
// "no redirect parameter" security decision).
const CORE_LOGIN_URL = "https://www.odentia.co/login";

// Coordinated logout (Core <-> Marketplace) — landing point for
// Core-initiated logout: Core's own use-shell-logout.ts ends its real
// Supabase session first, then navigates the browser HERE to also clear
// odentia_customer_session. Never redirects back to Core's own
// /auth/logout — whichever app the user actually clicked "Salir" in is
// responsible for its OWN cleanup before ever navigating to the other
// app's endpoint, so no Core <-> Marketplace <-> Core loop is possible.
//
// Deliberately GET, unauthenticated, and idempotent: the only possible
// effect of visiting this URL is ending the CURRENT browser's own
// Marketplace customer recognition — never someone else's, never a
// privilege change. Accepted as an intentional "logout CSRF" trade-off,
// not an oversight (see the coordinated-logout audit's own security
// decisions) — a signed one-time token/state would add real complexity to
// prevent a forced logout, which is not worth doing.
//
// Touches ONLY odentia_customer_session — never odentia_session (the
// separate Marketplace admin/operator session, see src/lib/session.ts)
// and never odentia_cart (which must survive any customer logout, see
// src/lib/cart.ts).
export async function GET() {
  await deleteCustomerSession();
  return NextResponse.redirect(CORE_LOGIN_URL);
}
