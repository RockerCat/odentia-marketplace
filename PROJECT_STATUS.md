# PROJECT_STATUS.md

# Odentia Marketplace

**Last Updated:** 2026-09-15 (Checkpoint 2 added)

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
