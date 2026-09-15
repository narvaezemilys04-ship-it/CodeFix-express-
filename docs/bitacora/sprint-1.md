# Bitácora — Sprint 1 (Autenticación y negocio)

Registro breve por sesión: lo planeado, lo completado y los bloqueos (Plan de Trabajo v1.0, sección 2.3).

## Sesión 2026-09-15

**Planeado:** Tarjeta [Sprint 1 - 01] — rama y esquema de datos base (Negocio, Usuario, Rol).

**Completado:**
- Rama `sprint-1` creada desde `main`.
- `backend/prisma/schema.prisma`: agregados los modelos `Negocio`, `Usuario` y el enum `Rol` (DDS secciones 3.2/3.3).
- Se dio de baja `model PruebaConexion` (ya cumplió su función de validar la conexión a MySQL).
- Se agregó `url = env("DATABASE_URL")` al bloque `datasource`, que faltaba en `prisma.config.ts`.

**Bloqueos:**
- `prisma.config.ts` no traía `datasource.url`, pero Prisma en realidad carga `prisma7.config.ts` (que sí la tenía) — no bloqueó nada, solo generó confusión inicial.
- Primer intento de `url = env("DATABASE_URL")` en el `datasource` de `schema.prisma` falló: en Prisma 7 esa propiedad **ya no se soporta ahí** (breaking change respecto al ejemplo del DDS v1.0, escrito para Prisma clásico). Se revirtió esa línea; la URL vive solo en `prisma7.config.ts`.
- `node_modules` del backend no estaba instalado; se corrió `npm install` antes de migrar.

**Resultado:**
- Migración `20260915152908_add_negocio_usuario` aplicada contra `codefix_express` en `localhost:3306`.
- Se eliminó la tabla `pruebaconexion` (ya cumplida su función) y se crearon `Negocio` y `Usuario` con el enum `Rol`, FK `Usuario.tenantId → Negocio.id` e índice en `tenantId`.
- `npx prisma generate` ejecutado sin errores.
- Pendiente: commit del cambio (`git add`/`git commit` referenciando RF-001/RF-002) — a cargo del responsable del proyecto.

## Sesión 2026-09-15 (continuación)

**Planeado:** Tarjeta [Sprint 1 - 02] — Backend: registro de negocio (RF-001).

**Completado:**
- `backend/src/config/prisma.js` — singleton del cliente Prisma (lo van a reusar todos los servicios siguientes).
- `backend/src/utils/hash.js` — `hashPassword`/`comparePassword` con bcrypt, factor de costo 10 (RNF-002).
- `backend/src/validators/negocios.validator.js` — validación de campos obligatorios y formato de correo.
- `backend/src/services/negocios.service.js` — `registrarNegocioConAdmin` con `prisma.$transaction`, mapea violaciones de unicidad (NIT / correo) a errores de dominio.
- `backend/src/controllers/negocios.controller.js` — mapea errores a `{ error: { codigo, mensaje } }` (formato DDS 4.1); nunca expone `contraseñaHash`.
- `backend/src/routes/negocios.routes.js` — `POST /api/negocios`, montada en `app.js`.

**Bloqueos (dos breaking changes más de Prisma 7, no documentados en el DDS v1.0):**
1. `new PrismaClient()` sin argumentos ya no conecta a nada — Prisma 7 exige un **driver adapter** explícito. Se instaló `@prisma/adapter-mariadb` (sirve para MySQL) y se pasa `new PrismaMariaDb(process.env.DATABASE_URL)` al constructor.
2. La forma de identificar una violación de unicidad (error `P2002`) cambió: ya no viene en `error.meta.target`, sino en `error.meta.driverAdapterError.cause.constraint.index`. El servicio ahora revisa ambas rutas por compatibilidad.

**Resultado (probado manualmente contra el servidor real, puerto 3000):**
- `POST /api/negocios` con datos válidos → 201, `negocio` + `usuario` (sin `contraseñaHash`).
- Body incompleto → 400 con los mensajes de validación.
- NIT repetido → 409 `NIT_DUPLICADO`.
- Correo repetido → 409 `CORREO_DUPLICADO`.
- Datos de prueba eliminados de la base al terminar.
- Pendiente: commit referenciando RF-001.

## Sesión 2026-09-15 (continuación 2)

**Planeado:** Tarjeta [Sprint 1 - 03] — Backend: login con JWT (RF-002).

**Completado:**
- `backend/src/utils/jwt.js` — `firmarToken`/`verificarToken` (`JWT_SECRET`, `JWT_EXPIRES_IN` desde `.env`, default 8h).
- `backend/src/validators/auth.validator.js` — valida `correo`/`contrasena` obligatorios.
- `backend/src/services/auth.service.js` — `login(correo, contrasena)`: única consulta sin `tenantId` (DDS 5.2.1), compara con bcrypt, firma el JWT con `{ id, rol, tenantId }`. También rechaza usuarios con `activo=false` (adelanto de RF-003, necesario para no dejar un agujero de seguridad).
- `backend/src/controllers/auth.controller.js` — mapea a 200/400/401.
- `backend/src/routes/auth.routes.js` — `POST /api/auth/login`, montada en `app.js`.

**Bloqueos:** ninguno — no hubo sorpresas nuevas de Prisma 7 esta vez (reusa el mismo `config/prisma.js`).

**Resultado (probado manualmente contra el servidor real, puerto 3000):**
- Login con credenciales correctas → 200, token JWT decodificado confirma payload `{ id, rol, tenantId, iat, exp }` exacto (DDS 7.1).
- Contraseña incorrecta → 401 `CREDENCIALES_INVALIDAS`.
- Correo inexistente → 401, **mismo mensaje genérico** que contraseña incorrecta (no se filtra si el correo existe).
- Usuario desactivado (`activo=false`) → 401, mismo mensaje genérico.
- Body incompleto → 400.
- Datos de prueba eliminados de la base al terminar.
- Pendiente: commit referenciando RF-002.

## Sesión 2026-09-15 (continuación 3)

**Planeado:** Tarjeta [Sprint 1 - 04] — Middleware de autenticación, tenant y roles (RF-020).

**Completado:**
- `backend/src/utils/errors.js` — clase base `AppError` + subclases (`ValidationError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409), formato de respuesta `{ error: { codigo, mensaje } }` (DDS 4.1).
- `backend/src/middlewares/auth.middleware.js` — verifica `Authorization: Bearer <token>`, adjunta `req.user = { id, rol, tenantId }`.
- `backend/src/middlewares/tenant.middleware.js` — adjunta `req.tenantId` desde `req.user.tenantId`.
- `backend/src/middlewares/role.middleware.js` — `role(...rolesPermitidos)`, factory de middleware.
- `backend/src/middlewares/error.middleware.js` — montado al final de `app.js`, traduce `AppError` a la respuesta HTTP correspondiente.

**Cómo se probó (sin rutas protegidas reales todavía — esta tarjeta es prerrequisito de S1-05):**
Se creó una ruta temporal `_diagnostico.routes.js` con `auth + tenant + role("ADMIN")` encadenados, se generaron tokens de prueba (`ADMIN`, `VENDEDOR`) firmados con la misma utilidad JWT, y se probó contra el servidor real:
- Sin token → 401 `NO_AUTENTICADO`.
- Header sin prefijo `Bearer` → 401 (tratado igual que "sin token").
- Token corrupto/inválido → 401, mensaje distinto ("inválido o expirado").
- Token válido pero rol `VENDEDOR` contra ruta que exige `ADMIN` → 403 `NO_AUTORIZADO`.
- Token válido y rol `ADMIN` → 200, con `req.user` y `req.tenantId` correctamente propagados.
La ruta de diagnóstico y su montaje en `app.js` se eliminaron al terminar — no quedan en el código final.

**Observación arquitectónica (no bloqueante, a decidir):** `negocios.controller.js` y `auth.controller.js` (Sprint 1-02 y 1-03) manejan sus propios `try/catch` con `res.status()` directo, en vez de `next(err)` + `AppError` + este `error.middleware` centralizado. Ambos ya producen el mismo formato de respuesta `{ error: { codigo, mensaje } }`, así que no hay inconsistencia de contrato — pero sí dos mecanismos distintos conviviendo en el mismo backend. Se puede homogeneizar en una tarea aparte si se considera necesario; no se tocó en esta tarjeta para no exceder su alcance.

**Bloqueos:** ninguno.

**Pendiente:** commit referenciando RF-020.

## Sesión 2026-09-15 (continuación 4)

**Planeado:** Tarjeta [Sprint 1 - 05] — Gestión de usuarios internos y roles (RF-003, RF-004).

**Completado:**
- `backend/src/validators/usuarios.validator.js` — valida creación (`nombre`, `correo`, `contrasena`, `rol` ∈ {ADMIN,VENDEDOR,CONTADOR}) y actualización (`rol` y/o `activo`).
- `backend/src/services/usuarios.service.js` — `listarUsuarios`, `crearUsuario`, `actualizarUsuario`; **todo método recibe `tenantId` y lo aplica en el `where`** (DDS 5.3); nunca devuelve `contraseñaHash`.
- `backend/src/controllers/usuarios.controller.js` — usa `next(error)` + `error.middleware` (patrón centralizado de S1-04; código nuevo ya no repite el `try/catch` manual de las tarjetas anteriores).
- `backend/src/routes/usuarios.routes.js` — `GET/POST /api/usuarios`, `PATCH /api/usuarios/:id`, con `auth + tenant + role("ADMIN")` aplicado a nivel de router completo.

**Resultado (probado manualmente contra el servidor real, con DOS negocios distintos para verificar aislamiento):**
- `GET /api/usuarios` sin token → 401.
- Admin A lista usuarios → 200, solo ve los de su propio negocio.
- Admin A crea un VENDEDOR → 201.
- Ese VENDEDOR se loguea con éxito → 200 (confirma el criterio de aceptación de la tarjeta).
- El VENDEDOR intenta `GET /api/usuarios` → 403 (rol insuficiente, endpoint real, no el de diagnóstico ya borrado).
- Admin A desactiva al VENDEDOR (`PATCH activo:false`) → 200; el VENDEDOR ya no puede loguearse → 401.
- **Aislamiento multi-tenant** (lo más crítico, DDS 5.3 + Plan de Trabajo sección 6): Admin B lista usuarios → 200, ve únicamente a Admin B, nada del Negocio A. Admin B intenta `PATCH /api/usuarios/6` (id real de un usuario del Negocio A, adivinado) → **404 "Usuario no encontrado"**, no 403 — no delata ni siquiera que el recurso existe en otro tenant.
- Todos los datos de prueba (2 negocios, 3 usuarios) eliminados de la base al terminar.

**Bloqueos:** ninguno.

**Pendiente:** commit referenciando RF-003 y RF-004.
