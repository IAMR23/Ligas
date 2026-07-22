# Backend

Backend Express modular para LigaFutbol MVP.

## Scripts

```bash
npm install
npm run dev
```

## Base de datos

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Para aplicar migraciones sin crear una nueva:

```bash
npm run prisma:deploy
```

El seed crea roles iniciales, permisos, `SUPER_USUARIO`, usuarios demo de arbitro/vocal, reportes iniciales, torneo demo, equipos, jugadores, cancha, ronda, partido y asignaciones.

## Estructura principal

- `src/config`: variables, constantes y Swagger/OpenAPI
- `src/database`: cliente Prisma
- `src/middlewares`: autenticacion, roles, errores, validacion y auditoria
- `src/modules`: modulos funcionales del MVP
- `src/shared`: utilidades compartidas
- `prisma`: schema y seed
- `storage/reports`: archivos exportados
