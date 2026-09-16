-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "buyerType" TEXT;

-- Backfill BEFORE tightening the constraint below: every Order that
-- already has coreUserId/clinicId set was created before Patient support
-- existed, so it is unambiguously a clinic-member order — there is no
-- other historical shape to reclassify. Guest orders (coreUserId null)
-- correctly stay buyerType = NULL, untouched.
UPDATE "Order" SET "buyerType" = 'clinic_member' WHERE "coreUserId" IS NOT NULL AND "clinicId" IS NOT NULL;

-- Replaces order_core_attribution_pair (20260915120000) — that constraint
-- only expressed "coreUserId and clinicId are both null or both non-null"
-- and deliberately left membershipId/coreRole unconstrained. It cannot
-- express a Patient order (coreUserId set, clinicId null), so it must be
-- dropped before the new constraint can be added.
ALTER TABLE "Order" DROP CONSTRAINT "order_core_attribution_pair";

-- The real structural guarantee: an Order is unambiguously exactly one of
-- three shapes, never a fourth.
--   - Guest: buyerType and all four Core reference fields are NULL.
--   - Patient: buyerType = 'patient', coreUserId is set, and clinicId/
--     membershipId/coreRole are all NULL — a real Odentia identity with
--     structurally no clinic attribution (see the buyer-identity/
--     clinic-attribution audit: a Patient's own linked patients.clinic_id
--     is never written here, on purpose).
--   - Clinic Member: buyerType = 'clinic_member' and coreUserId/clinicId/
--     membershipId/coreRole are ALL set together — tightened from the
--     previous constraint, which allowed membershipId/coreRole to be
--     independently null; every historical attributed Order already
--     satisfies this (checkout has only ever written those two fields
--     together with coreUserId/clinicId), so this is a zero-risk
--     tightening, not a loosening.
-- Any other combination (a stray buyerType value, a half-populated shape,
-- buyerType set without coreUserId, etc.) is structurally impossible to
-- insert or update.
ALTER TABLE "Order" ADD CONSTRAINT "order_buyer_attribution_shape" CHECK (
  ("buyerType" IS NULL AND "coreUserId" IS NULL AND "clinicId" IS NULL AND "membershipId" IS NULL AND "coreRole" IS NULL)
  OR
  ("buyerType" = 'patient' AND "coreUserId" IS NOT NULL AND "clinicId" IS NULL AND "membershipId" IS NULL AND "coreRole" IS NULL)
  OR
  ("buyerType" = 'clinic_member' AND "coreUserId" IS NOT NULL AND "clinicId" IS NOT NULL AND "membershipId" IS NOT NULL AND "coreRole" IS NOT NULL)
);
