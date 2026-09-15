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
