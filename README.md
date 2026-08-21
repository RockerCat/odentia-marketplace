# Odentia

Marketplace de implementos odontológicos. Next.js (App Router) + PostgreSQL (Supabase) vía Prisma.

## Stack

- **Next.js 16** (App Router, Server Actions)
- **Prisma 7** con el driver adapter `@prisma/adapter-pg`
- **PostgreSQL** alojado en Supabase
- **Supabase Storage** para las imágenes de productos
- **Tailwind CSS 4**

## Desarrollo local

1. Instalar dependencias (esto también genera el cliente de Prisma vía `postinstall`):
   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env` y completar:
   - `DATABASE_URL`: cadena de conexión de Supabase (Project Settings → Database → Connection string).
   - `SESSION_SECRET`: generar con `openssl rand -base64 32`.
   - `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API.

3. Aplicar el esquema a la base de datos:
   ```bash
   npx prisma migrate deploy
   ```

4. (Opcional) Sembrar datos de ejemplo y el usuario admin (`admin@odentia.com` / `odentia2026`):
   ```bash
   npx prisma db seed
   ```

5. Crear en Supabase Storage un bucket público llamado `product-images`.

6. Levantar el servidor:
   ```bash
   npm run dev
   ```

## Estructura

- `src/app/(shop)` — catálogo público, carrito, checkout.
- `src/app/admin` — panel de administración (protegido, requiere login).
- `src/app/login` — login del panel admin.
- `src/lib` — Prisma, sesión, carrito (cookies), Supabase Storage.
- `src/proxy.ts` — protege las rutas `/admin` (antes "middleware").
- `prisma/schema.prisma` — modelos de datos.
- `prisma/seed.ts` — datos de ejemplo.
