# MVP LigaFutbol

## Flujo funcional

El recorrido principal del MVP es:

1. Crear campeonato.
2. Registrar equipos.
3. Registrar jugadores con foto y asignarlos a equipos.
4. Generar fixture todos contra todos desde el campeonato.
5. Consultar fechas y partidos.
6. Iniciar partido.
7. Registrar goles, tarjetas, sustituciones y observaciones.
8. Finalizar partido.
9. Consultar tabla, goleadores, disciplina y sanciones.
10. Abrir vista publica sin login.

## Arquitectura relevante

El backend mantiene el patron modular existente:

- `routes`: rutas Express y middlewares.
- `schemas`: validacion Zod.
- `controllers`: adaptacion HTTP.
- `services`: reglas de negocio.
- `repositories`: acceso Prisma.

El frontend mantiene React + Vite + PWA con pantallas mobile-first y la cola offline existente en `app/src/shared/offline`.

Los listados operativos principales usan paginacion con `page` y `limit`, manteniendo en la respuesta la coleccion (`players`, `teams`, `tournaments`, `matches`) y el objeto `pagination`.

La foto del jugador se guarda como `photoUrl`; en el MVP puede ser una imagen data URL cargada desde el formulario o una URL publica.

## Reglas del torneo

El modelo `Tournament` almacena reglas MVP:

- `format`: por ahora `LEAGUE`.
- `roundTrip`: `false` para solo ida, `true` para ida y vuelta.
- `pointsWin`: default `3`.
- `pointsDraw`: default `1`.
- `pointsLoss`: default `0`.
- `tiebreakers`: default `GOAL_DIFF`, `GOALS_FOR`, `HEAD_TO_HEAD`.

La logica no quema 3-1-0: la finalizacion toma los puntos desde el torneo.

## Fixture

El generador usa round-robin/circle method:

- Funciona con numero par o impar de equipos.
- Si hay impar, una posicion descansa por fecha.
- No genera equipo contra si mismo.
- Solo ida crea `n * (n - 1) / 2` partidos.
- Ida y vuelta crea `n * (n - 1)` partidos.
- Crea registros existentes `Round` y `Match`.
- El backend bloquea la generacion si el campeonato ya tiene partidos para evitar duplicados.

## Standings

Los eventos de gol modifican marcador y estadisticas individuales.

Al finalizar el partido:

- El partido pasa a `FINALIZADO`.
- Se guarda el resultado final.
- Se recalculan `Standing` y estadisticas finales de equipo desde todos los partidos finalizados del torneo.
- Se evita doble conteo porque `TeamStatistic.goalsFor/goalsAgainst` ya no se incrementa en cada gol.
- La finalizacion esta protegida por update condicional sobre estado `EN_JUEGO`.

Orden inicial de tabla:

1. Puntos.
2. Diferencia de goles.
3. Goles a favor.
4. Nombre del equipo como desempate estable.

`HEAD_TO_HEAD` queda almacenado para una V2, pero no se fuerza con logica incompleta.

## Offline

La cola offline existente se conserva.

La pantalla de partido usa `saveMatchEventOfflineFirst` para:

- Goles.
- Autogoles.
- Goles de penal.
- Tarjetas.
- Sustituciones.
- Observaciones.

Cada evento usa `clientEventId`, y el backend valida unicidad para evitar duplicados al sincronizar.

## Vista publica

Ruta frontend:

- `/public/tournaments/:id`

Endpoint:

- `GET /api/public/tournaments/:id`

Muestra solo informacion deportiva publica:

- Tabla.
- Proximos partidos.
- Resultados recientes.
- Goleadores.

No muestra administracion, auditoria, logs, pagos ni datos privados.

## Pendiente para V2

- Correccion administrativa segura de eventos y marcadores.
- Enfrentamiento directo real para desempates.
- Reglamentos disciplinarios configurables.
- Lineups y minutos jugados reales para `matchesPlayed` de jugadores.
- Gestion completa de canchas.
- Asignacion estricta de arbitros/vocales a partidos en permisos backend.
- Resolucion avanzada de conflictos offline.
- Fases complejas, eliminatorias, ascensos/descensos y estadisticas avanzadas.
