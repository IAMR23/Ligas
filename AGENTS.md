# Guia de agentes del proyecto BARRIAL

## Resumen del producto

BARRIAL / LigaFutbol MVP es un monorepo para administrar una liga de futbol. Incluye un backend modular en Node.js + Express, una PWA en React + Vite y persistencia PostgreSQL con Prisma.

El sistema cubre autenticacion JWT, roles, torneos, equipos, jugadores, partidos, eventos del partido, reportes y auditoria. Tambien existen modulos preparados para canchas, arbitros, rondas, sanciones, tabla de posiciones, sincronizacion y vocalia.

## Estructura principal

- `backend/`: API Express con arquitectura modular.
- `backend/prisma/`: schema, migraciones y seeds.
- `app/`: frontend PWA React mobile-first.
- `database/`: recursos de base de datos.
- `docs/`: documentacion adicional del proyecto.
- `docker-compose.yml`: stack local con servicios del proyecto.

## Backend

El backend usa ES modules, Express 5, Prisma Client, Zod, JWT, bcrypt, Helmet, CORS, Morgan, Pino, PDFKit, ExcelJS y Swagger UI.

Patron dominante por modulo:

- `*.routes.js`: rutas Express y middlewares.
- `*.schemas.js`: validacion Zod de `body`, `params` y `query`.
- `*.controller.js`: adapta HTTP y devuelve respuestas.
- `*.service.js`: reglas de negocio.
- `*.repository.js`: acceso a Prisma.
- `*.constants.js`: enums/listas del dominio.

Respuesta estandar:

```json
{
  "success": true,
  "message": "Operacion realizada correctamente",
  "data": {}
}
```

Errores:

```json
{
  "success": false,
  "message": "No se pudo completar la operacion",
  "detail": null,
  "traceId": "uuid"
}
```

Rutas activas montadas en `backend/src/app.js`:

- `GET /health`
- `GET /api/public/onboarding`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `/api/users`
- `/api/roles`
- `/api/tournaments`
- `/api/teams`
- `/api/players`
- `/api/matches`
- `/api/matches/:id/events`
- `/api/reports`
- `/api/logs`
- Swagger UI en `GET /api/docs`
- OpenAPI JSON en `GET /api/docs.json`

## Seguridad y roles

La autenticacion usa `Authorization: Bearer {accessToken}`. Los roles principales son:

- `SUPER_USUARIO`
- `ADMIN`
- `ARBITRO`
- `VOCAL`
- `DELEGADO`
- `JUGADOR`
- `PUBLICO`

`SUPER_USUARIO` puede pasar cualquier control de rol. Las rutas publicas son login, registro, recuperacion de contrasena, refresh token y onboarding publico.

## Base de datos

Prisma apunta a PostgreSQL. El schema incluye usuarios, roles, permisos, refresh tokens, reset tokens, torneos, categorias, equipos, jugadores, canchas, rondas, partidos, eventos, arbitros, vocales, vocalias, sanciones, pagos, tablas, estadisticas, reportes, auditoria, logs de login, sincronizacion, conflictos y notificaciones.

Seeds importantes:

- `npm --workspace backend run seed`
- `npm --workspace backend run seed:champions2018`

Usuario inicial documentado:

- Email: `superadmin@ligafutbol.com`
- Password: `ChangeMe123`

## Frontend

La app esta en `app/` y usa React 19, Vite, React Router, TanStack Query, Axios, Dexie y Lucide. Tiene providers de autenticacion/offline y pantallas para login, registro, dashboard, torneos, equipos, jugadores, reportes, logs y sincronizacion.

## Comandos utiles

Desde la raiz:

```bash
npm run dev:backend
npm run dev:app
npm run build:app
npm run seed:champions2018
```

Desde `backend/`:

```bash
npm run dev
npm run start
npm run seed
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:studio
```

## Variables de entorno

Copiar:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp app/.env.example app/.env
```

Variables backend clave:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_MINUTES`
- `REFRESH_TOKEN_EXPIRES_DAYS`
- `CORS_ORIGIN`
- `REPORTS_STORAGE_PATH`
- `SUPER_USER_EMAIL`
- `SUPER_USER_USERNAME`
- `SUPER_USER_PASSWORD`

## Reglas para agentes

- Usar primero el grafo MCP del codebase para descubrir funciones, rutas y relaciones; caer a busqueda de texto solo para literales, configs o archivos no indexados.
- Respetar la arquitectura modular existente.
- Mantener cambios pequenos y enfocados.
- No revertir cambios del usuario.
- Si se agrega una ruta activa, actualizar `backend/src/docs/openapi.js`.
- Validar con comandos del proyecto antes de entregar cuando sea posible.
