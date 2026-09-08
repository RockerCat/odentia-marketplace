-- Enable Row-Level Security on every app table in the public schema.
-- This app connects with the Postgres owner role via Prisma, which bypasses
-- RLS by default (table owners are exempt unless FORCE ROW LEVEL SECURITY is
-- set), so this has no effect on the app's own database access. It only
-- blocks Supabase's auto-generated public REST API (PostgREST), which
-- authenticates as the low-privilege "anon"/"authenticated" roles and would
-- otherwise be able to read/write these tables directly.
--
-- _prisma_migrations is intentionally left out: it's Prisma's own internal
-- bookkeeping table (no app data), and altering it here breaks the shadow
-- database `prisma migrate dev` creates to replay migrations, since that
-- table doesn't exist yet at replay time.

ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."OrderItem" ENABLE ROW LEVEL SECURITY;
