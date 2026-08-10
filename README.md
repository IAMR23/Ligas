# LigaFutbol MVP

Monorepo para un MVP de gestion de liga de futbol con backend modular en Node.js + Express, frontend PWA en React + Vite y PostgreSQL con Prisma.

## Requisitos

- Node.js 20 o superior
- Docker y Docker Compose
- PostgreSQL opcional para ejecucion local sin Docker

## Estructura

```text
LigaFutbolMVP/
|-- backend/
|-- app/
|-- database/
|-- docs/
|-- docker-compose.yml
|-- .env.example
|-- .gitignore
`-- README.md
```

## Funcionalidades MVP

- Campeonatos con reglas basicas: formato `LEAGUE`, ida o ida/vuelta, puntos por victoria/empate/derrota y desempates.
- CRUD existente de torneos, equipos y jugadores.
- Listados principales con paginacion (`page`, `limit`).
- Foto de jugador desde el formulario de jugadores.
- Detalle de campeonato en `/tournaments/:id` con resumen, equipos, fixture, tabla, goleadores y sanciones.
- Generador automatico de fixture todos contra todos usando `Round` y `Match`.
- Pantallas reales de fixture, partidos y eventos.
- Eventos de partido offline-first para goles, tarjetas, sustituciones y observaciones con `clientEventId`.
- Finalizacion consistente de partidos: consolida standings y estadisticas de equipo sin doble contabilizacion.
- Tabla de posiciones, goleadores, disciplina y sanciones.
- Vista publica sin login en `/public/tournaments/:id`.
- Dashboard operativo con campeonatos activos, partidos de hoy, partidos en juego y cola offline.

## Configurar variables en CMD

```cmd
copy .env.example .env
copy backend\.env.example backend\.env
copy app\.env.example app\.env
```

## Correr con Docker

```cmd
docker compose up -d --build
```

## Correr backend manual

```cmd
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

## Datos Champions League 2018

Para cargar el torneo Champions League 2018 con 10 equipos, 24 jugadores y fixture todos contra todos:

```cmd
npm run seed:champions2018
```

Ese seed crea `UCL-2018`, equipos con codigo `UCL18-*`, jugadores con documento `UCL18-*` y partidos `UCL18-Fxx-Pxx` si el torneo aun no tenia partidos.

Para aplicar migraciones en un entorno ya preparado:

```cmd
cd backend
npm run prisma:deploy
npm run seed
```

## Correr app

```cmd
cd app
npm install
npm run dev
```

## URLs

- Backend: http://localhost:4000
- Swagger: http://localhost:4000/api/docs
- App: http://localhost:5173

## Usuario inicial

- Correo: superadmin@ligafutbol.com
- Contrasena: ChangeMe123
- Arbitro demo: arbitro.demo@ligafutbol.com / ChangeMe123
- Vocal demo: vocal.demo@ligafutbol.com / ChangeMe123

## Rutas principales

- `POST /api/tournaments/:id/fixture/generate`
- `GET /api/tournaments/:id/fixture`
- `GET /api/tournaments/:id/standings`
- `GET /api/tournaments/:id/scorers`
- `GET /api/tournaments/:id/discipline`
- `GET /api/tournaments/:id/sanctions`
- `POST /api/matches/:id/start`
- `POST /api/matches/:id/finish`
- `POST /api/matches/:id/events/goal`
- `POST /api/matches/:id/events/card`
- `POST /api/matches/:id/events/substitution`
- `GET /api/public/tournaments/:id`

Los listados `GET /api/tournaments`, `GET /api/teams`, `GET /api/players` y `GET /api/matches` aceptan `page` y `limit`.

## Flujo de demo

1. Iniciar sesion.
2. Crear o abrir un campeonato.
3. Registrar equipos y jugadores.
4. Generar fixture desde el detalle del campeonato.
5. Abrir un partido, iniciarlo y registrar eventos.
6. Finalizar el partido.
7. Revisar tabla, goleadores, disciplina/sanciones.
8. Abrir `/public/tournaments/:id` sin login para consultar informacion publica.
