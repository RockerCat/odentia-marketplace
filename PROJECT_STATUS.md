# PROJECT_STATUS.md

# Odentia Marketplace

**Last Updated:** 2026-09-15 (Shared Cart Checkpoint B closed)

---

# Estado actual

**SSO Core → Marketplace: COMPLETO en Production.** El flujo de autorización
(Core emite un authorization code opaco de un solo uso → Marketplace lo
intercambia server-to-server contra Core → Marketplace crea su propia
`odentia_customer_session`) está desplegado y validado end-to-end en
Production, separado de la sesión administrativa existente (`odentia_session`,
Prisma `User`, exclusiva de operadores LopaDent/Marketplace).

**Checkpoint 2026-09-15 — Order Attribution, Checkpoint 1: PASS.** Commit
`ca05abf`. `Order` ahora persiste, de forma nullable, la identidad Core
certificada que originó cada pedido:

- `coreUserId` — usuario Core;
- `clinicId` — clínica Core;
- `membershipId` — membership que certificó el contexto;
- `coreRole` — snapshot del role en el momento de la compra (auditoría, nunca
  autorización).

Migración `20260915120000_add_order_core_attribution` aplicada exitosamente
contra la base de datos correcta de Marketplace; `npx prisma migrate status`
confirmó `Database schema is up to date!`. Sin backfill: los pedidos
históricos permanecen con los cuatro campos en `NULL` (guest), sin identidad
inventada.

**Semántica:**
- **Guest checkout se preserva sin cambios.** Marketplace sigue siendo
  accesible públicamente; no se agregó ningún gate de autenticación al
  checkout ni un modelo `Customer`/`User` customer paralelo. Core continúa
  siendo la única autoridad de identidad, membership y clínica.
- **Atribución exclusivamente server-side e inmutable tras la creación.** Se
  obtiene únicamente vía `getCustomerSession()` dentro de `placeOrderAction`,
  nunca desde `FormData`, hidden inputs, query params o estado del navegador.
  Se escribe una única vez, en el `order.create(...)` inicial. El fast-path
  por `idempotencyKey` y el recovery ante `P2002` continúan redirigiendo al
  Order ganador sin tocar sus campos de atribución bajo ninguna circunstancia
  — un retry no puede convertir un pedido guest en Core-atribuido, ni
  viceversa, ni reasignarlo a otro usuario/clínica/membership/role.
- **Buyer/contact snapshot permanece independiente.** `customerName`,
  `customerEmail`, `customerPhone`, `address` y `notes` siguen siendo el
  snapshot histórico de contacto/entrega del pedido, sin relación estructural
  con la identidad Core — quien hace el pedido puede legítimamente ser
  distinto de quien recibe la entrega.
- **Invariante estructural en DB.** Constraint `order_core_attribution_pair`
  (SQL explícito en la migración — Prisma 7.9.1 no soporta `@@check` de forma
  declarativa) exige que `coreUserId` y `clinicId` sean ambos `NULL` o ambos
  no-`NULL`; una atribución parcial es estructuralmente imposible.
- **Preparado para agregación futura por clínica.** Índices `coreUserId` y
  `(clinicId, createdAt)` — este último deja listo, sin implementar todavía
  ninguna regla comercial, el acceso futuro a "compras por clínica en un
  rango de fechas".

**Smoke real en Production — ambos escenarios PASS:**
- **Core-attributed:** flujo real Core autenticado → SSO → `odentia_customer_
  session` → carrito → checkout produjo un Order con los cuatro campos
  poblados correctamente (role certificado: `clinic_admin`).
- **Guest:** sin `odentia_customer_session` (verificado en ventana
  incógnito), entrando directo a Marketplace sin pasar por Core, produjo un
  Order con los cuatro campos en `NULL` y el flujo de thank-you funcionando
  normalmente — confirma que la integración con Odentia no cerró el
  checkout público.

**Checkpoint 2026-09-15 — Order Attribution, Checkpoint 2: Admin visibility
— PRODUCTION PASS.** Commit `77946ee`. El detalle administrativo de un
pedido (`/admin/pedidos/[id]`) distingue `Cliente Odentia` de `Invitado`. Un
pedido atribuido muestra `clinicId` y una etiqueta legible del `coreRole`
snapshoteado al momento de la compra (`clinic_admin` → Administrador de
clínica, `dentist` → Odontólogo, `assistant` → Asistente; un valor
desconocido se muestra tal cual, nunca se inventa significado). `coreUserId`
y `membershipId` siguen persistidos pero deliberadamente no se muestran en
esta pantalla. No existe ningún lookup hacia Core: toda la información viene
únicamente de la fila `Order` ya persistida localmente. Esta sección es
puramente informativa — no es autorización, no es editable, y no cambió
checkout/SSO/schema.

**Production smoke manual — 2026-09-15 — ambos escenarios PASS:**
- **Guest Admin Visibility: PASS.** Sobre el Order guest de Checkpoint 1: se
  ve el badge `Invitado` con su explicación, sin clínica/role, sin
  `coreUserId`/`membershipId`, y el resto del detalle (incluyendo `Estado
  del pedido`) funciona normalmente.
- **Core-attributed Admin Visibility: PASS.** Sobre el Order Core-attributed
  de Checkpoint 1: se ve el badge `Cliente Odentia`, la clínica vía
  `clinicId`, el role como `Administrador de clínica` (snapshot
  `clinic_admin`), sin `coreUserId`/`membershipId`, sin lookup hacia Core y
  sin edición de attribution.

**Order Attribution — estado general:**
- Checkpoint 1 (persistence/server attribution): **PASS**.
- Checkpoint 2 (admin visibility): **PRODUCTION PASS**.

Order attribution base is complete; next product/commercial phase to be
defined separately.

**Checkpoint 2026-09-15 — Shared Cart, Checkpoint A — PRODUCTION PASS.**
Commit `436285a` (Marketplace); Core's read-only counterpart is commit
`fff396b` in `odentia-core`. `odentia_cart` continues to be the single
source of truth for the cart — Marketplace remains its only writer.
In Production the cookie is domain-shared under `.odentia.co` so Core's
authenticated header can read the same real cart server-side; Vercel
Preview deployments and local development keep the previous host-only
cookie unchanged (a `Domain` that doesn't match the actual response host
would make the browser reject the cookie outright). Core only ever reads
and derives a count (sum of quantities, same semantics as this repo's own
`getCartCount()`) — it never writes, mutates, or clears this cookie, and
there is no new API/fetch/DB involved on either side. The storefront header
(`src/app/(shop)/layout.tsx`) now shows a cart icon with a badge (same
orange treatment as Core's own cart badge) instead of the previous
teal/primary text link, still driven entirely by the existing
`getCartCount()`, hidden at 0.

**Production smoke manual — 2026-09-15 — PASS:**
- Marketplace cart at `1` → Core badge `1` after refresh — **PASS**.
- Marketplace cart updated to `2` → Core badge `2` after refresh — **PASS**.
- Marketplace cart cleared to empty → badge disappeared on both Marketplace
  and Core — **PASS**.

These three smokes are the only ones executed; full checkout was not
re-tested as part of this checkpoint.

**Shared Cart — Checkpoint A: CLOSED.**

**Checkpoint 2026-09-15 — Shared Cart, Checkpoint B — PRODUCTION PASS.**
Commit `78243e1` (Marketplace); Core's counterpart is commit `fa61bb4` in
`odentia-core`. Core's cart icon now navigates to Marketplace's existing
`/auth/sso/start?return_to=/carrito` — after a successful customer SSO, the
user lands on `/carrito` instead of `/`. Every other Core → Marketplace
entry point (sidebar, tab bar, `marketplace-card.tsx`) still hits
`/auth/sso/start` with no `return_to` and still lands on `/`, unchanged.

The destination stays entirely Marketplace-owned: a second, short-lived
HttpOnly cookie (`odentia_sso_return_to`) mirrors `odentia_sso_state`'s
exact lifecycle (same callback-scoped path, same TTL, `SameSite=Lax`, same
`Secure` behavior, single-use — deleted unconditionally in the callback).
Marketplace accepts exactly one literal destination, `/carrito` — no
prefix matching, no arbitrary same-origin paths, no absolute/
protocol-relative URLs. A `start` request without a valid `return_to`
explicitly clears any stale cookie from an earlier attempt, so a leftover
cart intent can never contaminate a later, unrelated SSO run. The
destination is re-validated by exact string comparison only *after* state
validation, the server-to-server code exchange, payload validation, and
customer-session creation have all already succeeded — it never
participates in any of those checks, and every existing failure path still
falls back to `/` exactly as before. `state`, `redirect_uri`, the one-time
SSO code, and Core's SSO routes/RPCs/DB were not touched by this
checkpoint.

**Production smoke manual — 2026-09-15 — PASS:**
- Core cart icon (empty cart, badge hidden) → SSO → landed on
  `https://marketplace.odentia.co/carrito`, correctly showing "Tu carrito
  está vacío." — **PASS**.
- Generic Marketplace navigation from Core's sidebar (not the cart icon) →
  SSO → landed on `https://marketplace.odentia.co/` (not `/carrito`) —
  **PASS**.
- SSO started with a `return_to` other than the one allowed value → landed
  on `https://marketplace.odentia.co/` (neither the invalid value nor
  `/carrito`) — **PASS**.

These three smokes are the only ones executed for this checkpoint.

**Shared Cart — Checkpoint B: CLOSED.**

**Next focus:** Marketplace header/customer identity consistency with
Core — not yet designed or implemented.
