-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "coreUserId" TEXT,
ADD COLUMN     "clinicId" TEXT,
ADD COLUMN     "membershipId" TEXT,
ADD COLUMN     "coreRole" TEXT;

-- CreateIndex
CREATE INDEX "Order_coreUserId_idx" ON "Order"("coreUserId");

-- CreateIndex
CREATE INDEX "Order_clinicId_createdAt_idx" ON "Order"("clinicId", "createdAt");

-- Prisma's schema DSL has no declarative representation for a multi-column
-- CHECK constraint (confirmed empirically against this project's Prisma
-- version, 7.9.1: `@@check` is rejected by `prisma validate` with
-- "Attribute not known: '@check'"), so this constraint is hand-written SQL
-- rather than generated from schema.prisma. It guarantees an Order is
-- unambiguously either a guest order (coreUserId and clinicId both NULL)
-- or a Core-attributed one (both NOT NULL) — a half-attributed row (e.g.
-- clinicId set without coreUserId) can never be inserted or updated.
-- membershipId/coreRole are intentionally excluded: they are enrichment on
-- top of an already-attributed order, not part of the guest/attributed
-- boundary itself.
ALTER TABLE "Order" ADD CONSTRAINT "order_core_attribution_pair" CHECK (("coreUserId" IS NULL) = ("clinicId" IS NULL));
