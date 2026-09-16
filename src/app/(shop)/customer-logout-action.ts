"use server";

import { redirect } from "next/navigation";
import { deleteCustomerSession } from "@/lib/customer-session";

// Fixed literal, never a user-suppliable URL — same "no redirect
// parameter" decision as Core's own /auth/logout route (see
// src/app/auth/logout/route.ts). `?source=marketplace` is a closed
// discriminator Core checks against the exact literal "marketplace",
// never interpolated into a URL on Core's side — it only ever picks
// between Core's own two hardcoded destinations, so this can never become
// an open redirect no matter what this constant's value is.
const CORE_LOGOUT_URL = "https://www.odentia.co/auth/logout?source=marketplace";

// Marketplace-initiated half of coordinated logout. Clears ONLY
// odentia_customer_session — never odentia_session (Marketplace's
// separate admin/operator session, see src/lib/session.ts) and never
// odentia_cart (which must survive any customer logout, see src/lib/
// cart.ts) — then hands off to Core's own /auth/logout, which ends the
// real Supabase session too and, recognizing this as the
// Marketplace-initiated half via `source=marketplace`, redirects back
// here (Marketplace's own home) instead of landing on Core's login page.
// Idempotent: calling this with no active customer session is a harmless
// no-op.
export async function logoutCustomerSession() {
  await deleteCustomerSession();
  redirect(CORE_LOGOUT_URL);
}
