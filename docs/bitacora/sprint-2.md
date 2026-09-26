# Bitácora — Sprint 2 (Productos e inventario)

Registro breve por sesión: lo planeado, lo completado y los bloqueos (Plan de Trabajo v1.0, sección 2.3).

## Sesión 2026-09-26

**Planeado:** Retomar Sprint 2 sobre la rama compartida `sprint-2` del repositorio original, ya iniciada por otro colaborador.

**Contexto encontrado al empezar:**
- El PR #1 (Sprint 1) ya fue mergeado a `main` del repo original.
- Otro colaborador ya había agregado a `main` (commit `27d6a37`, directo, sin PR) los modelos `CategoriaProducto`, `Producto`, `MovimientoInventario`.
- Existe una rama `sprint-2` en el repo original con un commit adicional (`a4cf402`) que crea `backend/src/validators/categorias.validator.js` y `backend/src/services/categorias.service.js`, ambos vacíos (0 bytes) — placeholders de la tarjeta `[Sprint 2 - 02] [01]`.

**Hallazgo crítico (bloqueante, corregido antes de seguir):** ninguna de las tres entidades nuevas (`CategoriaProducto`, `Producto`, `MovimientoInventario`) tenía `tenantId`. Esto rompe el aislamiento multi-tenant — el riesgo más alto identificado en el Plan de Trabajo (sección 6): sin `tenantId`, todos los negocios habrían compartido el mismo catálogo de productos, categorías y movimientos de inventario. Contradice directamente el DDS v1.0 (sección 3.1): *"Todas las entidades de negocio (excepto Negocio en sí) incluyen una clave foránea `tenantId` hacia Negocio, y toda consulta del backend debe filtrar por ese campo."*

**Decisión (consultada y confirmada con el responsable del proyecto):** corregir el schema antes de construir nada encima, y continuar el trabajo sobre la rama `sprint-2` ya existente (no crear una rama paralela), para no duplicar esfuerzo con el otro colaborador.

**Completado:**
- `backend/prisma/schema.prisma`: agregado `tenantId` + relación a `Negocio` + `@@index([tenantId])` en `CategoriaProducto`, `Producto` y `MovimientoInventario`.
- `CategoriaProducto`: unicidad de `nombre` pasó de no existir a `@@unique([tenantId, nombre])` (DDS 3.3: el mismo nombre de categoría puede repetirse entre negocios distintos, no dentro del mismo).
- `Producto`: el campo `codigo` pasó de `@unique` global a `@@unique([tenantId, codigo])` — dos negocios distintos deben poder usar el mismo código interno de producto sin chocar entre sí.
- Se respetaron el resto de las decisiones de nombres ya tomadas por el otro colaborador (`stock` en vez de `stockActual`, `@@map` a snake_case, campo `codigo`) — no es un problema de seguridad, son preferencias de estilo válidas.
- Migración `20260926055027_add_productos_categorias_inventario_con_tenant` generada y aplicada contra `codefix_express` en `localhost:3306` (las tablas no existían aún en la base local; nadie había corrido la migración).

**Bloqueos:** ninguno técnico — el bloqueo fue de coordinación (schema compartido con un defecto de seguridad), resuelto por decisión explícita del responsable del proyecto antes de continuar.

**Pendiente:** commit referenciando la corrección; avisar al otro colaborador sobre el cambio de `tenantId` antes de que continúe sobre los archivos vacíos que ya creó (`categorias.validator.js`, `categorias.service.js`), ya que ahora deben recibir `tenantId` como primer parámetro (mismo patrón de `negocios.service.js`/`usuarios.service.js` del Sprint 1).

## Sesión 2026-09-26 (continuación) — [Sprint 2 - 02] [01] y [02]: Categorías

**Completado:**
- `backend/src/validators/categorias.validator.js` — llenado (estaba vacío, placeholder de Laura Sofia): `validarCrearCategoria(body)` exige `nombre`.
- `backend/src/services/categorias.service.js` — llenado: `crearCategoria(tenantId, datos)` y `listarCategorias(tenantId)`, con detección de `P2002` → `ConflictError`.
- `backend/src/controllers/categorias.controller.js`, `backend/src/routes/categorias.routes.js` (nuevos) — endpoints `GET/POST /api/categorias`, montados en `app.js`.
- `npx prisma generate` corrido explícitamente: el cliente generado no incluía los modelos nuevos hasta regenerarlo (la migración por sí sola no bastó).

**Bug real encontrado y corregido:** `role()` (Sprint 1) usa rest params (`role(...rolesPermitidos)`). Lo llamé como `role(["ADMIN","VENDEDOR","CONTADOR"])` (un array), lo que hace que `rolesPermitidos` termine siendo `[[array]]` — ningún rol real coincide nunca, y el ADMIN recibía 403 en todos los endpoints, incluso los que debía poder usar. Corregido a `role("ADMIN", "VENDEDOR", "CONTADOR")` (argumentos separados). Se encontró probando de verdad contra el servidor real, no revisando el código a simple vista. Las tarjetas de Notion `[Sprint 2-03][02]` y `[Sprint 2-04][02]` tenían el mismo error de sintaxis en su texto — ya corregidas para que no se repita.

**Resultado (probado contra el servidor real):**
- `GET /api/categorias` sin token → 401.
- ADMIN crea una categoría → 201; la lista → 200 con esa categoría; la crea de nuevo → 409 `CATEGORIA_DUPLICADA`.
- VENDEDOR puede listar (200) pero no crear (403).
- Datos de prueba eliminados de la base al terminar.

**Pendiente:** commit referenciando RF-006 (además del commit pendiente de la corrección del schema).
