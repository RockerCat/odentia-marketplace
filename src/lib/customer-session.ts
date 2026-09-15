import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Session primitives for a customer identity CERTIFIED BY ODENTIA CORE via
// its SSO exchange (POST /api/sso/exchange, see SSO A/B) — never a
// Marketplace-native account. There is no password, no signup, no Prisma
// User for this identity: registration, authentication, profile and clinic
// membership all live in Core; Marketplace only holds this certified
// identity temporarily, in its own cookie, signed with its own secret.
// Deliberately a separate file/cookie/secret from src/lib/session.ts (the
// existing Marketplace/LopaDent admin session) — the two must never be
// interchangeable, verifiable with each other's secret, or read from each
// other's cookie.

const COOKIE_NAME = "odentia_customer_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24h — shorter than the admin session's 7d on purpose: this identity is only as fresh as Core's last SSO handshake.

// Mirrors Core's clinic_memberships.role enum (clinic_admin/dentist/
// assistant) — kept as a flat literal catalog here rather than importing
// anything from Core (no shared package exists), so this is the one place
// that must stay in sync with it.
const ROLE_CATALOG = ["clinic_admin", "dentist", "assistant"] as const;
export type MembershipRole = (typeof ROLE_CATALOG)[number];

// The identity Core certifies after a successful SSO exchange. Every field
// here is either required by the SSO contract (coreUserId, clinicId) or an
// approved-but-not-required-elsewhere claim (membershipId, role, name,
// email) — nothing else is allowed onto this session: no PHI, no billing/
// subscription data, no access token, no authorization code, no shared
// secret.
export type CustomerIdentity = {
  coreUserId: string;
  clinicId: string;
  membershipId: string;
  role: MembershipRole;
  firstName: string;
  lastName: string;
  email: string;
};

function getEncodedSecret(): Uint8Array {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (!secret) {
    throw new Error("CUSTOMER_SESSION_SECRET is not configured — refusing to create or read a customer session");
  }
  return new TextEncoder().encode(secret);
}

function isMembershipRole(value: unknown): value is MembershipRole {
  return typeof value === "string" && (ROLE_CATALOG as readonly string[]).includes(value);
}

// Deliberately strict: every claim is required and type-checked, not just
// the two the SSO contract calls "required" — a JWT with a valid signature
// but a malformed/partial payload (an upstream bug, or a stale token from a
// future contract shape) must fail closed here, never get trusted
// partially.
function isCustomerIdentity(payload: unknown): payload is CustomerIdentity {
  if (typeof payload !== "object" || payload === null) return false;
  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.coreUserId === "string" &&
    candidate.coreUserId.length > 0 &&
    typeof candidate.clinicId === "string" &&
    candidate.clinicId.length > 0 &&
    typeof candidate.membershipId === "string" &&
    candidate.membershipId.length > 0 &&
    isMembershipRole(candidate.role) &&
    typeof candidate.firstName === "string" &&
    typeof candidate.lastName === "string" &&
    typeof candidate.email === "string" &&
    candidate.email.length > 0
  );
}

// Signs a customer JWT from an already-certified identity. Never called
// with anything the browser supplied directly — `identity` must be the
// result of Core's SSO exchange (SSO D wires that up; this file only
// provides the primitive). Throws — fails closed — if
// CUSTOMER_SESSION_SECRET is missing, rather than ever signing with an
// absent/empty key.
export async function signCustomerSession(identity: CustomerIdentity): Promise<string> {
  return new SignJWT({ ...identity })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getEncodedSecret());
}

// Verifies a customer JWT: signature + expiration (jwtVerify), then payload
// shape and role catalog (isCustomerIdentity). Any failure — missing
// secret, bad signature, expired, malformed payload — resolves to null,
// mirroring decrypt()'s own swallow-all-errors convention in
// src/lib/session.ts, so callers never special-case *why* there is no
// session.
export async function verifyCustomerSession(token: string | undefined): Promise<CustomerIdentity | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), { algorithms: ["HS256"] });
    return isCustomerIdentity(payload) ? payload : null;
  } catch {
    return null;
  }
}

// Establishes ONLY the customer session cookie — never reads, writes, or
// otherwise touches odentia_session (the admin cookie/secret/Prisma User
// are a completely separate identity, see src/lib/session.ts).
export async function createCustomerSession(identity: CustomerIdentity): Promise<void> {
  const token = await signCustomerSession(identity);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    sameSite: "lax",
    path: "/",
  });
}

// Deletes ONLY the customer session cookie — never the admin session.
export async function deleteCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Reads and verifies the customer session cookie. Deliberately reads ONLY
// odentia_customer_session — there is no fallback to odentia_session, so an
// admin's own cookie can never be mistaken for a customer session. Any
// invalid/missing/expired state resolves to null, never a thrown error.
export async function getCustomerSession(): Promise<CustomerIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyCustomerSession(token);
}
