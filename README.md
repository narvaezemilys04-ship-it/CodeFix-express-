# CodeFix Express

Plataforma web multi-tenant de facturación, inventario y reportes para pequeñas y medianas empresas (pymes). Cada negocio se registra con su propio administrador y trabaja con sus usuarios, productos, clientes y facturas de forma aislada: ningún usuario puede ver ni modificar datos de otro negocio.

Es un proyecto académico. Su alcance está definido en la Especificación de Requisitos de Software (ERS) y su arquitectura en el Documento de Diseño (DDS), ambos en [`docs/`](docs).

## El problema

Muchas pymes llevan la facturación, el inventario y los reportes de forma manual (cuadernos, hojas de cálculo dispersas o procesos informales). Eso produce desorden, pérdida de tiempo y errores en la información financiera y de stock. CodeFix Express automatiza esas tareas en una sola aplicación.

## Estado del proyecto

Los Sprints 1 a 4 están completos y mergeados en `main`. Cada cierre tiene su etiqueta (`sprint-1-done` a `sprint-4-done`) y su revisión en [`docs/bitacora`](docs/bitacora).

| Sprint | Alcance |
|---|---|
| 1 | Registro de negocio, inicio de sesión con JWT, roles y aislamiento multi-tenant. |
| 2 | Productos, categorías, movimientos de inventario y alertas de stock. |
| 3 | Clientes y emisión de facturas. |
| 4 | Anulación de facturas, filtros, panel con indicadores e integración de los sprints 2 a 4. |

Después de esos cierres se agregaron la gestión de usuarios, datos de demostración y un pulido de la interfaz alineado con los mapas de pantalla.

**Lo que todavía no está:** los reportes (RF-016 a RF-018) no están implementados, y la interfaz muestra "Módulo en construcción" en Reportes, Configuración y Perfil. Hay además criterios del ERS que se cumplen solo en parte (ver [Límites conocidos](#límites-conocidos)).

## Qué se puede hacer

- **Negocio y acceso.** Registrar un negocio con su administrador, iniciar y cerrar sesión, y gestionar usuarios (crear, cambiar el rol, activar o desactivar).
- **Productos e inventario.** Crear, editar, buscar y activar o desactivar productos. Registrar entradas, salidas y ajustes de stock, y ver las alertas de stock bajo o agotado.
- **Clientes.** Crear, editar, buscar y activar o desactivar clientes.
- **Facturación.** Emitir facturas con descuento automático de stock, IVA con la tarifa del negocio y numeración consecutiva por negocio. Filtrar el historial por estado, cliente y fechas, ver el detalle y anular con motivo (la anulación repone el stock).
- **Panel.** Ventas del mes, facturas emitidas y alertas de stock para el administrador.

## Roles

| Rol | Puede |
|---|---|
| `ADMIN` | Acceso completo: usuarios, productos, categorías, clientes, inventario, facturas (incluida la anulación) e indicadores del panel. |
| `VENDEDOR` | Emitir y consultar facturas, gestionar clientes, consultar productos y registrar salidas de inventario. |
| `CONTADOR` | Consultar facturas, productos e historial de inventario. |

La protección de rutas del frontend solo mejora la experiencia de usuario: el control de acceso real siempre lo aplica el backend. El detalle de cada ruta y endpoint está en los README de cada parte.

## Tecnologías

| Parte | Stack |
|---|---|
| Backend | Node.js (módulos ES), Express 5, Prisma 7 con el adaptador de MariaDB, JWT y `bcrypt`. |
| Base de datos | MySQL 8 o superior. |
| Frontend | React 19, React Router 7, Vite 8 y Axios, con CSS plano. |

## Estructura del repositorio

```
.
├── backend/     API REST (Express + Prisma). Ver backend/README.md
├── frontend/    Aplicación web (React + Vite). Ver frontend/README.md
└── docs/        ERS, DDS, plan de trabajo, mapas de pantalla, bitácora de sprints y guía de demo
```

## Puesta en marcha

Necesitas Node.js y npm (el proyecto se desarrolló con Node.js 24.13 y npm 11) y un servidor MySQL 8 o superior en ejecución. Cada parte tiene su propia configuración, con las variables de entorno y los pasos completos:

1. **Backend:** sigue [`backend/README.md`](backend/README.md). Resumen: instalar dependencias, crear `backend/.env`, crear una base de datos vacía, ejecutar `npx prisma migrate deploy` y `npx prisma generate`, y luego `npm run dev`. Escucha en `http://localhost:3000`.
2. **Frontend:** sigue [`frontend/README.md`](frontend/README.md). Resumen: instalar dependencias, crear `frontend/.env` con `VITE_API_URL` (debe terminar en `/api`, por ejemplo `http://localhost:3000/api`) y ejecutar `npm run dev`. Vite sirve en `http://localhost:5173`.
3. **Datos de demostración (opcional):** desde `backend/`, `npm run seed:demo` carga dos negocios ficticios con usuarios, productos, clientes y facturas.

Los archivos `.env` están ignorados por git: no subas credenciales al repositorio.

## Demostración

La guía [`docs/demo.md`](docs/demo.md) tiene las cuentas de demostración, los datos que quedan cargados, un recorrido sugerido de 10 minutos y las limitaciones que conviene decir con honestidad al presentar.

## Documentación

| Documento | Contenido |
|---|---|
| [`CodeFix_Express_ERS_v1.0.docx`](docs/CodeFix_Express_ERS_v1.0.docx) | Requisitos funcionales y no funcionales, con criterios de aceptación. |
| [`CodeFix_Express_DDS_v1.0.docx`](docs/CodeFix_Express_DDS_v1.0.docx) | Diseño de la arquitectura y del modelo de datos. |
| [`CodeFix_Express_Plan_de_Trabajo_v1.0.docx`](docs/CodeFix_Express_Plan_de_Trabajo_v1.0.docx) | Sprints, cronograma, estimaciones y riesgos. |
| Mapas de pantalla: [administrador](docs/Mapa_de_pantallas_usuario_admin.png), [vendedor](docs/Mapa_de_pantallas_usuario_vendedor.png), [contador](docs/Mapa_de_pantallas_usuario_contador.png) | Referencia visual de las pantallas por rol. |
| [`docs/bitacora`](docs/bitacora) | Registro de cada sprint y su revisión contra los criterios de aceptación. |
| [`docs/demo.md`](docs/demo.md) | Guía para presentar la aplicación. |

## Límites conocidos

- **Reportes (RF-016 a RF-018):** sin implementar.
- **Categorías:** solo se pueden crear y listar. Editarlas o desactivarlas no tiene endpoint ni pantalla (RF-006).
- **IVA:** la tarifa se define al registrar el negocio y todavía no se puede cambiar después (RF-011).
- **Búsqueda de facturas:** funciona por cliente, estado y fechas, pero no por número de factura (RF-014).
- **Historial por producto:** el backend lo soporta, pero la pantalla de inventario muestra el historial completo sin filtro por producto (RF-013).
- **Sesión:** el token se guarda solo en memoria, por lo que recargar la página cierra la sesión.
- **Pruebas:** no hay una suite de pruebas automatizadas. La verificación se hizo con scripts manuales contra un servidor real.
- **CORS:** está abierto (`cors()` sin restricciones). Restríngelo por entorno antes de publicar.

Estos puntos son el insumo del siguiente sprint. El detalle de cada parte está en [`backend/README.md`](backend/README.md#estado-y-límites-conocidos) y [`frontend/README.md`](frontend/README.md#estado-y-límites-conocidos).

## Flujo de trabajo

- Cada sprint se desarrolla en su propia rama y se integra a `main` mediante pull request, con un commit de merge. Al cerrar, se publica una etiqueta `sprint-N-done`.
- Los mensajes de commit usan [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/), con el identificador del requisito entre paréntesis cuando aplica (por ejemplo, `feat(RF-009): ...`).

## Licencia

El repositorio no define una licencia. Es un proyecto académico: consulta con los autores antes de reutilizar el código.
