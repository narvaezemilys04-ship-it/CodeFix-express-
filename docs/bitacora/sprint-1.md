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

## Sesión 2026-09-15 (continuación 5)

**Planeado:** Tarjeta [Sprint 1 - 06] — Frontend: registro de negocio y login (RF-001, RF-002).

**Completado:**
- `frontend/src/components/Button.jsx`, `Input.jsx` — componentes reutilizables mínimos (la carpeta `components/` estaba vacía, sin convención previa; se optó por archivos planos, sin subcarpeta por componente).
- `frontend/src/services/auth.service.js` — `registrarNegocio()`, `login()`, sobre el `api.js`/httpClient ya existente.
- `frontend/src/pages/auth/LoginPage.jsx` y `RegisterBusinessPage.jsx` (nombres ya definidos por el andamiaje del proyecto, en inglés — se respetaron tal cual, no se renombraron a los nombres en español de la tarjeta original).
- `frontend/src/App.jsx` — router mínimo (`BrowserRouter` con `/login` y `/registro-negocio`, catch-all a `/login`). El router completo con `AuthContext` y rutas protegidas es la próxima tarjeta (S1-07); acá solo lo necesario para poder probar de verdad estas dos pantallas.
- `frontend/src/App.css` — estilos base usando las variables de `index.css` (`--color-primary`, `--color-background`, etc.), sin inventar una paleta nueva.
- Tras un login/registro exitoso, la página muestra un mensaje de confirmación en vez de redirigir a `/dashboard` (esa ruta no existe todavía) — la conexión real con `AuthContext` y la navegación post-login se hacen en S1-07, tal como estaba previsto en la tarjeta original.

**Bloqueos:**
- `frontend/node_modules` tampoco estaba instalado — se corrió `npm install` antes de levantar Vite.
- Sin `.claude/launch.json` en la raíz de la sesión (`CodeFix Express/`, no dentro del repo `codefix-express/`) no se puede usar `preview_start`; se creó ese archivo para levantar `npm run dev --prefix codefix-express/frontend`. Vive fuera del repo git, no requiere commit.
- Falsa alarma visual: en una captura de pantalla el formulario parecía cortado/pegado al borde derecho. Se verificó con `getBoundingClientRect()` y `elementFromPoint()` que el centrado CSS es correcto — era solo el bajísimo contraste entre el blanco de la tarjeta y el gris casi blanco de fondo (`--color-background: #f5f7fa`), agravado por el reescalado de la captura (`devicePixelRatio: 1.25`). No se tocó el CSS.

**Resultado (probado de punta a punta en el navegador real, contra el backend real, no solo revisión de código):**
- Registro de negocio vía formulario → pantalla de éxito → link a login.
- Login con las credenciales recién registradas → pantalla de bienvenida con nombre y rol reales devueltos por el backend.
- Contraseña incorrecta → mensaje de error del backend visible en la UI ("Correo o contraseña incorrectos.").
- Envío con campos vacíos → validación del lado del cliente, sin llegar a pegarle a la API (RNF-006).
- NIT duplicado → mensaje de error del backend visible en la UI ("Ya existe un negocio registrado con ese NIT.").
- Consola del navegador revisada: sin warnings de React ni excepciones sin capturar (el único `[error]` es el log automático del navegador para el 401 de la prueba de credenciales inválidas, ya manejado por el `catch`).
- Todos los datos de prueba eliminados de la base al terminar.

**Pendiente:** commit referenciando RF-001 y RF-002.

## Sesión 2026-09-15 (continuación 6)

**Planeado:** trabajo intermedio pedido por el responsable del proyecto, fuera del Kanban — sistema de estilos global del frontend (`variables.css`, `reset.css`, `global.css`, `responsive.css`), antes de arrancar [Sprint 1 - 07]. Motivado por los mapas de pantallas (admin, contador, vendedor) que definen la paleta, el layout de sidebar/topbar, las cards de indicadores, las tablas y los badges de estado que va a usar toda la app.

**Completado:**
- `frontend/src/styles/variables.css` — consolida y amplía las 8 variables que vivían sueltas en `index.css` (mismos nombres y valores, no se rompió nada visual) y agrega: paleta de sidebar oscuro, colores de estado para badges (Activo/Inactivo, Completada/En proceso/Anulada, Bajo stock), tipografía, espaciado, radios, sombras, dimensiones de layout y z-index.
- `frontend/src/styles/reset.css` — reset moderno (box-sizing, márgenes, tablas, listas, `#root { isolation: isolate }`).
- `frontend/src/styles/global.css` — estilos base reutilizables en toda la app: formularios (`.btn`, `.input`, `.form-field`, movidos acá desde `App.css` porque son genéricos, no específicos de auth), layout `.app-sidebar`/`.app-topbar`/`.app-content` para las pantallas autenticadas, `.card`/`.stat-card` para los indicadores del dashboard, `.data-table` y `.badge-*` para las tablas y los pills de estado vistos en los tres mapas de pantalla.
- `frontend/src/styles/responsive.css` — breakpoints (1024/768/480px): sidebar colapsado en tablet, sidebar horizontal en mobile, tipografía y padding reducidos en pantallas chicas.
- `frontend/src/main.jsx` — importa los 4 archivos en orden (`reset` → `variables` → `global` → `responsive`), reemplazando el import de `index.css`.
- `frontend/src/index.css` — eliminado (su único contenido ya vive, ampliado, en `variables.css`).
- `frontend/src/App.css` — reducido a lo específico de las pantallas de auth (`.auth-page`, `.auth-form`, `.auth-switch`, `.auth-success`, `.auth-note` — esta última faltaba, ya se usaba en `LoginPage.jsx` sin estar definida).

**Resultado (verificado en el navegador, no solo "compila"):** se volvió a levantar el login y el registro de negocio (mismas pantallas de S1-06) para confirmar que no hubo ninguna regresión visual tras mover `.btn`/`.input`/`.form-field` a `global.css` y reemplazar `index.css`. Se ven idénticas a como quedaron en la tarjeta anterior. Sin errores de consola nuevos (los únicos `[error]` en consola eran 401/409 residuales de la sesión de pruebas anterior).

**Nota:** las clases de layout (`.app-sidebar`, `.app-topbar`, `.card`, `.data-table`, `.badge-*`) están definidas pero **todavía no se usan en ningún componente** — se crearon ahora, alineadas a los mapas de pantalla, para que las próximas tarjetas (Sprint 1-07 en adelante: dashboard, listados de productos/clientes/facturas) las consuman directamente en vez de reinventar estilos sueltos por pantalla.

**Bloqueos:** ninguno.

**Pendiente:** commit (no corresponde a ninguna tarjeta específica del Kanban; se sugiere un commit de infraestructura aparte antes de S1-07).

## Sesión 2026-09-15 (continuación 7)

**Planeado:** Tarjeta [Sprint 1 - 07] — Frontend: contexto de sesión, logout y rutas protegidas (RF-019, RF-020).

**Completado:**
- `frontend/src/context/authStorage.js` — puente en memoria entre el interceptor de Axios (fuera de React) y `AuthContext`; expone `getToken`/`setToken`/`clear`/`onClear`. Nunca usa `localStorage` (DDS 7.1).
- `frontend/src/context/AuthContext.jsx` — Context API + `useReducer` (tal como pide el DDS 6.2); expone `usuario`, `token`, `estaAutenticado`, `login()`, `logout()`. Se suscribe a `onClear` para reaccionar si la sesión se limpia desde fuera (un 401).
- `frontend/src/services/api.js` — interceptor de request agrega `Authorization: Bearer <token>`; interceptor de response llama a `clear()` en cualquier 401.
- `frontend/src/components/ProtectedRoute.jsx` — redirige a `/login` si no hay sesión; si recibe `rolesPermitidos` y el rol no está en la lista, redirige a `/dashboard`.
- `frontend/src/routes/index.jsx` — router completo: `/login` y `/registro-negocio` públicas; `/dashboard` protegida (cualquier rol); `/usuarios` protegida solo para `ADMIN`; catch-all que decide `/dashboard` o `/login` según haya sesión.
- `frontend/src/layouts/DashboardLayout.jsx` — sidebar + topbar usando las clases de `global.css` de la sesión anterior; el ítem "Usuarios" del sidebar solo se muestra si `usuario.rol === "ADMIN"`; botón real de "Cerrar sesión".
- `frontend/src/pages/dashboard/DashboardPage.jsx` — contenido real mínimo (nombre y rol del usuario logueado).
- `frontend/src/pages/usuarios/UsersPage.jsx` — placeholder protegido (el CRUD visual de usuarios no tiene tarjeta propia todavía en el Kanban; se deja explícito en el propio texto de la página).
- `LoginPage.jsx` y `RegisterBusinessPage.jsx` — conectados al `AuthContext` real: login exitoso ahora navega de verdad a `/dashboard` (ya no muestra el mensaje "esto se conecta en la próxima tarjeta"); ambas páginas redirigen a `/dashboard` si ya hay sesión activa.
- `App.jsx` — envuelve el router con `AuthProvider`.

**Bug real encontrado y corregido (no una falsa alarma esta vez):** en `styles/responsive.css`, la regla de tablet (`max-width: 1024px`, esconde el texto del sidebar) y la regla de mobile (`max-width: 768px`, convierte el sidebar en barra horizontal) se superponían en cualquier viewport menor a 768px — el sidebar quedaba horizontal PERO con el texto oculto, mostrando solo una "pill" de color vacía sin ninguna etiqueta legible. Se acotó la regla de tablet a `(max-width: 1024px) and (min-width: 769px)` para que no choque con la de mobile. Encontrado probando de verdad en el navegador en distintos anchos, no revisando el CSS en abstracto.

**Resultado (probado de punta a punta en el navegador, contra el backend real, con un ADMIN y un VENDEDOR reales):**
- `/dashboard` sin sesión → redirige a `/login`.
- Login como ADMIN → navega automáticamente a `/dashboard`, sidebar muestra "Inicio" y "Usuarios".
- ADMIN entra a `/usuarios` → carga el placeholder.
- Cerrar sesión → vuelve a `/login`; confirmado con `window.location.pathname` que la URL realmente cambió (no solo el contenido).
- Login como VENDEDOR → sidebar NO muestra "Usuarios".
- VENDEDOR fuerza la navegación directa a `/usuarios` (sin usar el link) → `ProtectedRoute` lo redirige a `/dashboard` igual — confirma que la protección es real, no solo ocultar el botón.
- **Simulación de 401**: se forzó un token corrupto en `authStorage` y se disparó una petición real a `/api/usuarios` desde la consola del navegador contra el `api.js` real de la app. El backend respondió 401, el interceptor limpió el token (`getToken()` volvió a dar `null`), y `window.location.pathname` confirmó la redirección real a `/login` — sin recargar la página, solo por el cambio de estado de React propagado por `onClear`.
- Todos los datos de prueba (1 negocio, 2 usuarios) eliminados de la base al terminar.

**Pendiente:** commit referenciando RF-019 y RF-020.
