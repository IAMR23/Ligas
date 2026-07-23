# LigaFutbolMVP

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

## Configurar variables

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp app/.env.example app/.env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item app/.env.example app/.env
```

## Correr con Docker

```bash
docker compose up -d --build
```

## Correr backend manual

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

## Datos Champions League 2018

Para cargar el torneo Champions League 2018 con 10 equipos y 24 jugadores:

```bash
npm run seed:champions2018
```

Ese seed crea `UCL-2018`, equipos con codigo `UCL18-*` y jugadores con documento `UCL18-*`, incluyendo Cristiano Ronaldo en Real Madrid y Lionel Messi en FC Barcelona.

Para aplicar migraciones en un entorno ya preparado:

```bash
cd backend
npm run prisma:deploy
npm run seed
```

## Correr app

```bash
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

## Estado de esta fase

El monorepo incluye estructura base, Docker, backend auth/JWT/roles, schema Prisma, migracion inicial y seed demo para continuar con los modulos funcionales del MVP.
