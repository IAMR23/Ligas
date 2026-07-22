# Transacciones

Las operaciones criticas del MVP deben ejecutarse con `prisma.$transaction`.
Si cualquier paso falla, Prisma revierte todos los cambios de la unidad de trabajo
y la API debe responder con el formato de error estandar.

## Registrar Gol

Endpoint implementado: `POST /api/matches/:id/events/goal`.

Flujo recomendado:

1. Validar que el partido exista y tenga estado `EN_JUEGO`.
2. Validar que el `clientEventId` no exista en `match_events`.
3. Validar que el jugador pertenece al equipo informado.
4. Insertar `MatchEvent` con tipo `GOL`, `AUTOGOL` o `GOL_PENAL`.
5. Actualizar marcador de `matches`.
6. Actualizar `player_statistics` y `team_statistics`.
7. Insertar `audit_logs`.

```js
await prisma.$transaction(async (tx) => {
  // validar partido
  // validar jugador/equipo
  // insertar evento
  // actualizar marcador y estadisticas
  // insertar audit_log
});
```

## Registrar Tarjeta

Endpoint implementado: `POST /api/matches/:id/events/card`.

Flujo recomendado:

1. Validar partido en `EN_JUEGO`.
2. Validar jugador/equipo.
3. Insertar `MatchEvent` `TARJETA_AMARILLA` o `TARJETA_ROJA`.
4. Actualizar estadisticas del jugador/equipo.
5. Si acumula dos amarillas, insertar evento o sancion por roja indirecta.
6. Si es roja directa, crear `sanctions`.
7. Insertar `audit_logs`.

## Finalizar Partido

Endpoint implementado: `POST /api/matches/:id/finish`.

Flujo recomendado:

1. Validar partido en `EN_JUEGO`.
2. Insertar `MatchEvent` `PARTIDO_FINALIZADO`.
3. Cambiar `matches.status` a `FINALIZADO` y completar `finishedAt`.
4. Recalcular marcador desde eventos validos.
5. Actualizar `standings`, `team_statistics` y `player_statistics`.
6. Insertar `audit_logs`.

## Sincronizar Eventos Offline

Flujo recomendado:

1. Insertar `sync_logs` con estado `ENVIANDO`.
2. Procesar cada item de la cola por `clientEventId`.
3. Rechazar duplicados sin duplicar `match_events`.
4. Si hay diferencia con servidor, crear `sync_conflicts`.
5. Marcar `sync_logs` como `SINCRONIZADO`, `ERROR` o `CONFLICTO`.
6. Insertar `audit_logs` con accion `SYNC`.

## Exportar Reporte

Flujo recomendado:

1. Validar permisos.
2. Crear `report_executions`.
3. Generar archivo PDF o Excel.
4. Actualizar `report_executions.filePath`.
5. Insertar `audit_logs` con `EXPORT_PDF` o `EXPORT_EXCEL`.

## Rollback

No se deben atrapar errores dentro de la transaccion salvo para enriquecerlos y
volver a lanzarlos. Si se lanza un error, Prisma ejecuta rollback y no quedan
datos parciales.
