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

## Sesión 2026-09-26 (continuación 2) — Backend completo: productos, inventario, alertas de stock

Implementadas de corrido a pedido del responsable del proyecto: `[Sprint 2-03][01]`, `[02]`, `[Sprint 2-04][01]`, `[02]`, `[Sprint 2-05][01]`.

**Completado:**
- `backend/src/validators/productos.validator.js`, `backend/src/services/productos.service.js` — `listar`, `crear`, `actualizar`, y `listarAlertasStock` (incluida de una vez en el mismo archivo, ya que la tarjeta `[Sprint 2-05]` solo agrega una ruta sobre este mismo service).
- `backend/src/controllers/productos.controller.js`, `backend/src/routes/productos.routes.js` — `GET/POST /api/productos`, `PATCH /api/productos/:id`, `GET /api/productos/alertas-stock` (montada antes de cualquier ruta con `:id`).
- `backend/src/validators/inventario.validator.js`, `backend/src/services/inventario.service.js` — `registrarMovimiento` (transacción atómica: crea el movimiento y actualiza `Producto.stock` en la misma operación) y `listarMovimientos`.
- `backend/src/controllers/inventario.controller.js`, `backend/src/routes/inventario.routes.js` — `POST/GET /api/inventario/movimientos`.
- `backend/src/app.js` — montadas las tres rutas nuevas.

**Decisiones de diseño tomadas (no estaban 100% especificadas):**
- `tipo=AJUSTE`: `cantidad` se interpreta como el **valor absoluto nuevo** de stock (reconciliación tras un conteo físico), no como un delta con signo — el schema no tiene un campo de signo, esta es la interpretación más simple y estándar de un ajuste de inventario.
- Reutilicé la clase genérica `ConflictError` (ya existente desde Sprint 1) con código `"STOCK_INSUFICIENTE"` en vez de crear una clase `StockInsuficienteError` nueva como sugería la tarjeta de Notion original — ya cumple exactamente esa función (409 + código configurable), crear una clase aparte habría sido redundante.
- Agregada una restricción que no estaba en el validator pero sí en el DDS clásico: un VENDEDOR solo puede registrar movimientos `tipo=SALIDA`; `ENTRADA`/`AJUSTE` quedan exclusivos de ADMIN. Implementada en el controller (el middleware `role()` no distingue por contenido del body).

**Resultado (probado contra el servidor real, con el negocio `tenantId=17` creado para esta sesión):**
- Productos: 401 sin token, 201 al crear, 403 si VENDEDOR intenta crear, 200 al actualizar precio.
- Alertas de stock: devuelve correctamente los productos con `stock < stockMinimo`.
- Inventario: ENTRADA y SALIDA actualizan `Producto.stock` correctamente en la misma transacción; una SALIDA mayor al stock disponible se rechaza (409 `STOCK_INSUFICIENTE`); VENDEDOR bloqueado en ENTRADA (403) pero permitido en SALIDA (201); VENDEDOR bloqueado en `GET /movimientos` (solo ADMIN/CONTADOR).

**Pendiente:** commit referenciando RF-005, RF-007, RF-008.

## Sesión 2026-09-26 (continuación 3) — Frontend completo: productos, inventario, alertas de stock

Implementadas de corrido: `[Sprint 2-06][01]` a `[04]`, `[Sprint 2-07][01]` a `[03]`.

**Completado:**
- `frontend/src/services/products.service.js`, `frontend/src/hooks/useProducts.js` — CRUD de productos y categorías, estado local sin store global (DDS 6.2).
- `frontend/src/components/Modal/Modal.jsx` (+ `.css`) — componente genérico controlado (`open`/`onClose`), sin acoplar a ningún dominio.
- `frontend/src/components/Select/Select.jsx` (+ `.css`) — mismo patrón que `Input`.
- `frontend/src/pages/productos/ProductsPage.jsx` (+ `.css`) — tabla con `Table`/`Badge` (Sprint 1), modal de creación/edición con `Modal`/`Select`/`Button`/`Input`, botón de activar/desactivar (baja lógica).
- `frontend/src/services/inventory.service.js`, `frontend/src/hooks/useInventory.js` — historial y registro de movimientos, alertas de stock.
- `frontend/src/pages/inventario/InventoryPage.jsx` (+ `.css`) — reusa `Modal` (no lo duplica); tipo de movimiento restringido a "Salida" en la UI cuando el rol es VENDEDOR (refleja la regla del backend).
- `frontend/src/pages/dashboard/AlertasStockWidget.jsx` (+ `.css`) — integrado en `DashboardPage`, visible solo para ADMIN (mismo permiso que el endpoint).
- Rutas `/productos` (cualquier rol) e `/inventario` (ADMIN y VENDEDOR) agregadas a `AppRoutes.jsx`; links correspondientes en el sidebar de `DashboardLayout.jsx`.

**Corrección arquitectónica en el camino:** `.form-field`/`.form-field-error` vivían solo en `Input.css`. Si `Select` las necesitaba (mismo contenedor de campo) sin que `Input` estuviera cargado en la misma página, hubieran quedado sin estilo — un acoplamiento implícito entre dos componentes que se supone son independientes. Se movieron a `global.css` como utility genuinamente compartida.

**Dos bugs reales encontrados probando en el navegador (no a simple vista):**
1. Un `<select>` controlado sin ninguna `<option>` que matchee el `value` (`""` inicial) muestra visualmente la primera opción del navegador como "seleccionada", pero el estado de React sigue vacío — al enviar el formulario sin tocar el select, el backend rechazaba con "La categoría es obligatoria" pese a que la UI mostraba una categoría elegida. Corregido preseleccionando la primera opción disponible al abrir el modal, tanto en `ProductsPage` (categoría) como en `InventoryPage` (producto y tipo).
2. `useInventory` cargaba el historial automáticamente al montar sin importar el rol — para VENDEDOR eso disparaba un `GET /movimientos` que el backend rechaza con 403 (VENDEDOR solo puede registrar, no listar). Se agregó el parámetro `cargarAlInicio` al hook para omitir esa llamada cuando el rol no tiene permiso.

**Resultado (probado en el navegador real, con ADMIN y VENDEDOR, contra el backend real):**
- Productos: tabla, creación, edición, activar/desactivar — todo con refresco automático tras cada mutación; VENDEDOR ve la lista sin controles de edición.
- Inventario: historial visible para ADMIN; VENDEDOR ve un mensaje explicativo en vez de un error, y su modal solo ofrece "Salida" como tipo; `ENTRADA`, `SALIDA` y `AJUSTE` probados end-to-end (el ajuste fija el stock al valor indicado, no lo suma).
- Widget de alertas: muestra correctamente los productos con stock bajo el mínimo, con badge de advertencia; oculto para roles sin permiso.
- Todos los datos de prueba (1 negocio, 2 usuarios, 3 productos, 1 categoría, 6 movimientos) eliminados de la base al terminar.

**Pendiente:** commit referenciando RF-005, RF-006, RF-007, RF-008 (frontend).
