"use server";

import { redirect } from "next/navigation";
import { deleteCustomerSession } from "@/lib/customer-session";

// Fixed literal, never accepted as input — same "no redirect parameter"
// decision as Core's own /auth/logout route (see src/app/auth/logout/
// route.ts for the Core-initiated half of this same coordinated flow).
const CORE_LOGOUT_URL = "https://www.odentia.co/auth/logout";

// Marketplace-initiated half of coordinated logout. Clears ONLY
// odentia_customer_session — never odentia_session (Marketplace's
// separate admin/operator session, see src/lib/session.ts) and never
// odentia_cart (which must survive any customer logout, see src/lib/
// cart.ts) — then hands off to Core's own /auth/logout, which ends the
// real Supabase session too and lands on Core's login page. Idempotent:
// calling this with no active customer session is a harmless no-op.
export async function logoutCustomerSession() {
  await deleteCustomerSession();
  redirect(CORE_LOGOUT_URL);
}
