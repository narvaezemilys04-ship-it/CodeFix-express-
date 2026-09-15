# Revisión y Retrospectiva — Sprint 1 (Autenticación y negocio)

Fecha de cierre: 2026-09-15
Verificación integral realizada como corrida de regresión fresca (registro de dos negocios nuevos vía UI real, no reutilizando datos de sesiones anteriores), además de las pruebas ya documentadas por tarjeta en `docs/bitacora/sprint-1.md`.

## 1. Revisión contra los criterios de aceptación del ERS v1.0 (sección 3.1)

### RF-001 — Registro de un negocio (tenant)

| Criterio de aceptación (ERS 3.1) | Resultado |
|---|---|
| Formulario de registro de negocio (nombre, NIT, correo del administrador, contraseña) | ✅ `RegisterBusinessPage`, probado vía UI real |
| Backend crea el negocio y su usuario Administrador en la misma transacción | ✅ `prisma.$transaction` en `negocios.service.js` |
| No permite registrar dos negocios con el mismo correo de administrador | ✅ `Usuario.correo` único a nivel de plataforma → 409 `CORREO_DUPLICADO` verificado |
| Contraseña almacenada con hash seguro (bcrypt) | ✅ `hash.js`, factor de costo 10; nunca se expone en ninguna respuesta |

### RF-002 — Inicio de sesión

| Criterio | Resultado |
|---|---|
| Ingreso por correo y contraseña | ✅ |
| Backend valida contra el hash almacenado | ✅ `bcrypt.compare` en `auth.service.js` |
| JWT emitido incluye id de usuario, rol y tenant | ✅ Verificado decodificando el token real: `{ id, rol, tenantId, iat, exp }` |
| El usuario autenticado accede únicamente a los datos de su propio negocio | ✅ Ver sección 2 (aislamiento multi-tenant) |

### RF-003 — Gestión de usuarios internos

| Criterio | Resultado |
|---|---|
| El Administrador puede crear un usuario asignándole un rol | ✅ `POST /api/usuarios`, probado con un VENDEDOR real |
| Puede modificar el rol o desactivar un usuario | ✅ `PATCH /api/usuarios/:id` |
| Un usuario desactivado no puede iniciar sesión | ✅ Verificado en esta corrida: login 200 antes de desactivar → `activo:false` → login 401 después |
| Todas las operaciones quedan restringidas al negocio del Administrador que las ejecuta | ✅ Ver sección 2 |

### RF-004 — Gestión de roles y permisos

| Criterio | Resultado |
|---|---|
| Cada usuario tiene un rol definido dentro de su negocio | ✅ Enum `Rol` (ADMIN, VENDEDOR, CONTADOR) en el modelo `Usuario` |
| El rol se incluye como claim en el JWT | ✅ |
| El frontend muestra funcionalidades según el rol recibido | ✅ El ítem "Usuarios" del sidebar solo aparece si `usuario.rol === "ADMIN"` |
| El backend valida el rol en cada endpoint protegido mediante middleware | ✅ `role.middleware`, probado con 403 real sobre `/api/usuarios` |

### RF-019 — Cierre de sesión

| Criterio | Resultado |
|---|---|
| El usuario dispone de una opción para cerrar sesión | ✅ Botón real en `DashboardLayout` |
| El cierre de sesión invalida/descarta el JWT en el cliente | ✅ `authStorage.clear()`, verificado que `getToken()` vuelve a `null` |
| Después de cerrar sesión no se puede acceder a páginas/endpoints protegidos sin autenticarse de nuevo | ✅ Verificado: tras logout, navegar a `/dashboard` redirige a `/login` |

### RF-020 — Control de acceso y aislamiento multi-tenant

| Criterio | Resultado |
|---|---|
| Cada endpoint valida token, rol y tenant mediante middleware antes de operar | ✅ `auth` + `tenant` + `role` encadenados en todas las rutas protegidas |
| Toda consulta a la base de datos se filtra automáticamente por el tenant | ✅ Todo método de `usuarios.service.js` recibe `tenantId` como primer parámetro y lo aplica en el `where` |
| Los usuarios sin autorización reciben 401/403 según corresponda | ✅ 401 sin token, 403 con rol insuficiente — ambos verificados con requests reales |
| El sistema no confía solo en restricciones de interfaz para el aislamiento | ✅ Ver sección 2 — probado a nivel de API directamente, no solo ocultando botones en la UI |

**Los 6 RF del sprint cumplen sus criterios de aceptación del ERS v1.0.**

## 2. Prueba de aislamiento multi-tenant (foco especial, riesgo más alto del Plan de Trabajo)

Ejecutada como corrida fresca, con dos negocios nuevos registrados vía `/registro-negocio` real (Negocio A y Negocio B, sin reutilizar datos de sesiones anteriores):

1. Negocio A (Admin A) creado vía UI. Negocio B (Admin B) creado vía UI.
2. Admin A crea un usuario VENDEDOR en su propio negocio.
3. `GET /api/usuarios` con token de Admin A → devuelve únicamente los 2 usuarios de Negocio A.
4. `GET /api/usuarios` con token de Admin B → devuelve únicamente a Admin B; **cero rastro** de Negocio A.
5. Admin B intenta `PATCH /api/usuarios/<id-real-de-Negocio-A>` (adivinando el ID) → **404 "Usuario no encontrado"**, no 403 — el sistema ni siquiera confirma que el recurso existe en otro tenant.
6. Un VENDEDOR de Negocio A, autenticado, fuerza la navegación directa a `/usuarios` (sin usar ningún link, escribiendo la ruta) → `ProtectedRoute` lo redirige a `/dashboard`. La protección es real a nivel de guard de rutas, no solo un botón oculto.

**Conclusión: el aislamiento multi-tenant funciona correctamente tanto a nivel de datos (backend) como de navegación (frontend), y no depende de que la UI oculte opciones.**

## 3. Consola del navegador

Revisada durante toda la corrida de regresión: sin warnings de React, sin excepciones sin capturar. Los únicos `[error]` registrados corresponden a las pruebas de fallo intencionales (credenciales inválidas, NIT duplicado) — son el log automático del navegador para la petición HTTP fallida, ya manejada por el `catch` correspondiente en cada página.

## 4. Retrospectiva personal (Plan de Trabajo, sección 2.3)

**Qué funcionó:**
- Probar cada endpoint contra el servidor real (nunca simulado) permitió detectar 3 breaking changes de Prisma 7 que el DDS v1.0 no contemplaba (ver `docs/bitacora/sprint-1.md`, sesiones de S1-01 y S1-02) antes de que se acumularan en varias tarjetas.
- El patrón `next(error)` + `error.middleware` centralizado (adoptado desde S1-05 en adelante) dejó el manejo de errores más limpio que el `try/catch` manual de las primeras dos tarjetas del sprint.
- Verificar con `getBoundingClientRect()`/`elementFromPoint()` en vez de confiar solo en capturas de pantalla evitó "corregir" un bug de CSS que en realidad no existía (S1-06), y sí permitió encontrar uno real que sí existía (el sidebar en `responsive.css`, S1-07).

**Qué no funcionó / hubo que ajustar sobre la marcha:**
- El DDS v1.0 fue escrito para Prisma clásico (pre-v7) y no anticipó: `url` fuera del `schema.prisma`, el driver adapter obligatorio, ni el cambio de shape del error `P2002`. Esto costó tiempo de diagnóstico en las primeras dos tarjetas técnicas del sprint.
- `backend/node_modules` y `frontend/node_modules` no estaban instalados al empezar — hubo que correr `npm install` en ambos antes de poder ejecutar nada, algo que debería verificarse al arrancar cualquier sprint nuevo.
- La reorganización de carpetas del frontend (`components/Button/Button.jsx`, `api/api.js`, `routes/AppRoutes.jsx`) se hizo a mitad de sprint, no desde el principio — quedó bien resuelta, pero conviene fijar la convención de carpetas en el Sprint 0 de un proyecto real para no reacomodar archivos ya en uso.

**Ajustes para el Sprint 2:**
- Verificar la convención de carpetas real del frontend con una exploración rápida antes de crear un componente nuevo, en vez de asumir el patrón usado en el sprint anterior.
- Los tres breaking changes de Prisma 7 ya están documentados en memoria (`codefix-express/prisma7-config`) — consultarlos antes de tocar `schema.prisma` o escribir un nuevo `*.service.js` con manejo de errores de unicidad.
- Mantener la disciplina de probar cada endpoint/pantalla contra el servidor real (no solo revisión de código) y limpiar los datos de prueba de la base al terminar cada sesión.

## 5. Estado de cierre

- Los 6 RF del sprint (RF-001, RF-002, RF-003, RF-004, RF-019, RF-020) cumplen sus criterios de aceptación del ERS v1.0.
- El aislamiento multi-tenant fue probado y documentado explícitamente, con evidencia (sección 2).
- Rama `sprint-1` lista para fusionar a `main` y etiquetar `sprint-1-done`.
