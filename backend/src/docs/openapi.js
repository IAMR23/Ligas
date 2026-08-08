const tournamentStatuses = ["BORRADOR", "ACTIVO", "FINALIZADO", "CANCELADO"];
const matchStatuses = ["PROGRAMADO", "EN_JUEGO", "FINALIZADO", "SUSPENDIDO", "CANCELADO", "DEFAULT"];
const matchEventTypes = [
  "PARTIDO_INICIADO",
  "PARTIDO_FINALIZADO",
  "GOL",
  "AUTOGOL",
  "GOL_PENAL",
  "TARJETA_AMARILLA",
  "TARJETA_ROJA",
  "SUSTITUCION",
  "LESION",
  "SUSPENSION_PARTIDO",
  "REANUDACION_PARTIDO",
  "PARTIDO_CANCELADO",
  "PARTIDO_DEFAULT",
  "OBSERVACION_ARBITRO",
  "OBSERVACION_VOCAL",
  "FIRMA_DELEGADO",
  "FIRMA_ARBITRO",
  "FIRMA_VOCAL"
];

const uuidParam = (name, description) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string", format: "uuid" }
});

const queryParam = (name, schema, description) => ({
  name,
  in: "query",
  required: false,
  description,
  schema
});

const jsonBody = (schemaRef, required = true) => ({
  required,
  content: {
    "application/json": {
      schema: { $ref: schemaRef }
    }
  }
});

const okResponse = (description = "Operacion realizada correctamente") => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ApiSuccess" }
    }
  }
});

const fileResponse = (mediaType, description) => ({
  description,
  content: {
    [mediaType]: {
      schema: { type: "string", format: "binary" }
    }
  }
});

const secured = [{ bearerAuth: [] }];

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "LigaFutbol MVP API",
    version: "0.1.0",
    description:
      "API REST para gestion de liga de futbol: autenticacion, roles, torneos, equipos, jugadores, partidos, eventos, reportes y auditoria."
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Backend local"
    }
  ],
  tags: [
    { name: "Sistema", description: "Salud y recursos publicos" },
    { name: "Autenticacion", description: "Registro, login, sesion y tokens" },
    { name: "Usuarios", description: "Administracion de usuarios" },
    { name: "Roles", description: "Administracion de roles" },
    { name: "Torneos", description: "Gestion de torneos" },
    { name: "Equipos", description: "Gestion de equipos" },
    { name: "Jugadores", description: "Gestion de jugadores" },
    { name: "Partidos", description: "Gestion de partidos" },
    { name: "Eventos", description: "Eventos registrados durante un partido" },
    { name: "Reportes", description: "Catalogo y exportacion de reportes" },
    { name: "Logs", description: "Auditoria, login, sync y errores" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Verificar estado del backend",
        responses: { 200: okResponse("Backend activo") }
      }
    },
    "/api/public/onboarding": {
      get: {
        tags: ["Sistema"],
        summary: "Obtener informacion publica de onboarding",
        responses: { 200: okResponse("Onboarding publico disponible") }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Autenticacion"],
        summary: "Registrar usuario publico",
        requestBody: jsonBody("#/components/schemas/RegisterRequest"),
        responses: {
          201: okResponse("Usuario registrado"),
          400: { $ref: "#/components/responses/BadRequest" },
          409: { $ref: "#/components/responses/Conflict" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Autenticacion"],
        summary: "Iniciar sesion",
        requestBody: jsonBody("#/components/schemas/LoginRequest"),
        responses: {
          200: okResponse("Sesion iniciada"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" }
        }
      }
    },
    "/api/auth/refresh-token": {
      post: {
        tags: ["Autenticacion"],
        summary: "Renovar access token usando refresh token",
        requestBody: jsonBody("#/components/schemas/RefreshTokenRequest"),
        responses: {
          200: okResponse("Token renovado"),
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      }
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Autenticacion"],
        summary: "Solicitar recuperacion de contrasena",
        requestBody: jsonBody("#/components/schemas/ForgotPasswordRequest"),
        responses: { 200: okResponse("Solicitud procesada") }
      }
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Autenticacion"],
        summary: "Restablecer contrasena",
        requestBody: jsonBody("#/components/schemas/ResetPasswordRequest"),
        responses: {
          200: okResponse("Contrasena restablecida"),
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Autenticacion"],
        summary: "Cerrar sesion",
        security: secured,
        requestBody: jsonBody("#/components/schemas/RefreshTokenRequest"),
        responses: {
          200: okResponse("Sesion cerrada"),
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Autenticacion"],
        summary: "Obtener usuario autenticado",
        security: secured,
        responses: {
          200: okResponse("Sesion activa"),
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Usuarios"],
        summary: "Listar usuarios",
        security: secured,
        responses: { 200: okResponse("Usuarios listados"), 403: { $ref: "#/components/responses/Forbidden" } }
      },
      post: {
        tags: ["Usuarios"],
        summary: "Crear usuario",
        security: secured,
        requestBody: jsonBody("#/components/schemas/CreateUserRequest"),
        responses: {
          201: okResponse("Usuario creado"),
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" }
        }
      }
    },
    "/api/users/{id}": {
      get: {
        tags: ["Usuarios"],
        summary: "Obtener usuario por id",
        security: secured,
        parameters: [uuidParam("id", "ID del usuario")],
        responses: {
          200: okResponse("Usuario obtenido"),
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      }
    },
    "/api/roles": {
      get: {
        tags: ["Roles"],
        summary: "Listar roles",
        security: secured,
        responses: { 200: okResponse("Roles listados"), 403: { $ref: "#/components/responses/Forbidden" } }
      },
      post: {
        tags: ["Roles"],
        summary: "Crear rol",
        security: secured,
        requestBody: jsonBody("#/components/schemas/CreateRoleRequest"),
        responses: {
          201: okResponse("Rol creado"),
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" }
        }
      }
    },
    "/api/tournaments": {
      get: {
        tags: ["Torneos"],
        summary: "Listar torneos",
        security: secured,
        parameters: [queryParam("status", { type: "string", enum: tournamentStatuses }, "Filtra por estado")],
        responses: { 200: okResponse("Torneos listados") }
      },
      post: {
        tags: ["Torneos"],
        summary: "Crear torneo",
        security: secured,
        requestBody: jsonBody("#/components/schemas/TournamentRequest"),
        responses: {
          201: okResponse("Torneo creado"),
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" }
        }
      }
    },
    "/api/tournaments/{id}": {
      get: {
        tags: ["Torneos"],
        summary: "Obtener torneo por id",
        security: secured,
        parameters: [uuidParam("id", "ID del torneo")],
        responses: { 200: okResponse("Torneo obtenido"), 404: { $ref: "#/components/responses/NotFound" } }
      },
      put: {
        tags: ["Torneos"],
        summary: "Actualizar torneo",
        security: secured,
        parameters: [uuidParam("id", "ID del torneo")],
        requestBody: jsonBody("#/components/schemas/TournamentUpdateRequest"),
        responses: {
          200: okResponse("Torneo actualizado"),
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" }
        }
      },
      delete: {
        tags: ["Torneos"],
        summary: "Eliminar torneo",
        security: secured,
        parameters: [uuidParam("id", "ID del torneo")],
        responses: { 200: okResponse("Torneo eliminado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/teams": {
      get: {
        tags: ["Equipos"],
        summary: "Listar equipos",
        security: secured,
        parameters: [
          queryParam("tournamentId", { type: "string", format: "uuid" }, "Filtra por torneo"),
          queryParam("categoryId", { type: "string", format: "uuid" }, "Filtra por categoria")
        ],
        responses: { 200: okResponse("Equipos listados") }
      },
      post: {
        tags: ["Equipos"],
        summary: "Crear equipo",
        security: secured,
        requestBody: jsonBody("#/components/schemas/TeamRequest"),
        responses: { 201: okResponse("Equipo creado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/teams/{id}": {
      get: {
        tags: ["Equipos"],
        summary: "Obtener equipo por id",
        security: secured,
        parameters: [uuidParam("id", "ID del equipo")],
        responses: { 200: okResponse("Equipo obtenido"), 404: { $ref: "#/components/responses/NotFound" } }
      },
      put: {
        tags: ["Equipos"],
        summary: "Actualizar equipo",
        security: secured,
        parameters: [uuidParam("id", "ID del equipo")],
        requestBody: jsonBody("#/components/schemas/TeamUpdateRequest"),
        responses: { 200: okResponse("Equipo actualizado"), 403: { $ref: "#/components/responses/Forbidden" } }
      },
      delete: {
        tags: ["Equipos"],
        summary: "Eliminar equipo",
        security: secured,
        parameters: [uuidParam("id", "ID del equipo")],
        responses: { 200: okResponse("Equipo eliminado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/players": {
      get: {
        tags: ["Jugadores"],
        summary: "Listar jugadores",
        security: secured,
        parameters: [
          queryParam("teamId", { type: "string", format: "uuid" }, "Filtra por equipo"),
          queryParam("q", { type: "string" }, "Busqueda por texto")
        ],
        responses: { 200: okResponse("Jugadores listados") }
      },
      post: {
        tags: ["Jugadores"],
        summary: "Crear jugador",
        security: secured,
        requestBody: jsonBody("#/components/schemas/PlayerRequest"),
        responses: { 201: okResponse("Jugador creado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/players/{id}": {
      get: {
        tags: ["Jugadores"],
        summary: "Obtener jugador por id",
        security: secured,
        parameters: [uuidParam("id", "ID del jugador")],
        responses: { 200: okResponse("Jugador obtenido"), 404: { $ref: "#/components/responses/NotFound" } }
      },
      put: {
        tags: ["Jugadores"],
        summary: "Actualizar jugador",
        security: secured,
        parameters: [uuidParam("id", "ID del jugador")],
        requestBody: jsonBody("#/components/schemas/PlayerUpdateRequest"),
        responses: { 200: okResponse("Jugador actualizado"), 403: { $ref: "#/components/responses/Forbidden" } }
      },
      delete: {
        tags: ["Jugadores"],
        summary: "Eliminar jugador",
        security: secured,
        parameters: [uuidParam("id", "ID del jugador")],
        responses: { 200: okResponse("Jugador eliminado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/players/{id}/teams": {
      post: {
        tags: ["Jugadores"],
        summary: "Asignar jugador a un equipo",
        security: secured,
        parameters: [uuidParam("id", "ID del jugador")],
        requestBody: jsonBody("#/components/schemas/AssignPlayerTeamRequest"),
        responses: { 200: okResponse("Jugador asignado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/matches": {
      get: {
        tags: ["Partidos"],
        summary: "Listar partidos",
        security: secured,
        parameters: [
          queryParam("tournamentId", { type: "string", format: "uuid" }, "Filtra por torneo"),
          queryParam("teamId", { type: "string", format: "uuid" }, "Filtra por equipo"),
          queryParam("status", { type: "string", enum: matchStatuses }, "Filtra por estado")
        ],
        responses: { 200: okResponse("Partidos listados") }
      },
      post: {
        tags: ["Partidos"],
        summary: "Crear partido",
        security: secured,
        requestBody: jsonBody("#/components/schemas/MatchRequest"),
        responses: { 201: okResponse("Partido creado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/matches/{id}": {
      get: {
        tags: ["Partidos"],
        summary: "Obtener partido por id",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        responses: { 200: okResponse("Partido obtenido"), 404: { $ref: "#/components/responses/NotFound" } }
      },
      put: {
        tags: ["Partidos"],
        summary: "Actualizar partido",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        requestBody: jsonBody("#/components/schemas/MatchUpdateRequest"),
        responses: { 200: okResponse("Partido actualizado"), 403: { $ref: "#/components/responses/Forbidden" } }
      },
      delete: {
        tags: ["Partidos"],
        summary: "Eliminar partido",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        responses: { 200: okResponse("Partido eliminado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/matches/{id}/start": {
      post: {
        tags: ["Partidos"],
        summary: "Iniciar partido",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        requestBody: jsonBody("#/components/schemas/MatchLifecycleRequest", false),
        responses: { 200: okResponse("Partido iniciado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/matches/{id}/finish": {
      post: {
        tags: ["Partidos"],
        summary: "Finalizar partido",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        requestBody: jsonBody("#/components/schemas/FinishMatchRequest", false),
        responses: { 200: okResponse("Partido finalizado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/matches/{id}/events": {
      get: {
        tags: ["Eventos"],
        summary: "Listar eventos de un partido",
        security: secured,
        parameters: [
          uuidParam("id", "ID del partido"),
          queryParam("type", { type: "string", enum: matchEventTypes }, "Filtra por tipo de evento")
        ],
        responses: { 200: okResponse("Eventos listados") }
      },
      post: {
        tags: ["Eventos"],
        summary: "Crear evento generico de partido",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        requestBody: jsonBody("#/components/schemas/MatchEventRequest"),
        responses: { 201: okResponse("Evento creado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/matches/{id}/events/goal": {
      post: {
        tags: ["Eventos"],
        summary: "Registrar gol",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        requestBody: jsonBody("#/components/schemas/GoalEventRequest"),
        responses: { 201: okResponse("Gol registrado"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/matches/{id}/events/card": {
      post: {
        tags: ["Eventos"],
        summary: "Registrar tarjeta",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        requestBody: jsonBody("#/components/schemas/CardEventRequest"),
        responses: { 201: okResponse("Tarjeta registrada"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/matches/{id}/events/substitution": {
      post: {
        tags: ["Eventos"],
        summary: "Registrar sustitucion",
        security: secured,
        parameters: [uuidParam("id", "ID del partido")],
        requestBody: jsonBody("#/components/schemas/SubstitutionEventRequest"),
        responses: { 201: okResponse("Sustitucion registrada"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/reports": {
      get: {
        tags: ["Reportes"],
        summary: "Listar reportes",
        security: secured,
        parameters: [queryParam("active", { type: "boolean" }, "Filtra por reportes activos")],
        responses: { 200: okResponse("Reportes listados") }
      }
    },
    "/api/reports/{code}/pdf": {
      get: {
        tags: ["Reportes"],
        summary: "Exportar reporte en PDF",
        security: secured,
        parameters: [
          { name: "code", in: "path", required: true, schema: { type: "string", minLength: 2 } },
          ...reportFilterParams()
        ],
        responses: { 200: fileResponse("application/pdf", "Archivo PDF"), 403: { $ref: "#/components/responses/Forbidden" } }
      }
    },
    "/api/reports/{code}/excel": {
      get: {
        tags: ["Reportes"],
        summary: "Exportar reporte en Excel",
        security: secured,
        parameters: [
          { name: "code", in: "path", required: true, schema: { type: "string", minLength: 2 } },
          ...reportFilterParams()
        ],
        responses: {
          200: fileResponse("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Archivo Excel"),
          403: { $ref: "#/components/responses/Forbidden" }
        }
      }
    },
    "/api/logs/audit": logPath("Listar logs de auditoria"),
    "/api/logs/login": logPath("Listar logs de login"),
    "/api/logs/sync": logPath("Listar logs de sincronizacion"),
    "/api/logs/errors": logPath("Listar logs de errores")
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    responses: {
      BadRequest: {
        description: "Datos invalidos",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } }
      },
      Unauthorized: {
        description: "No autenticado o token invalido",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } }
      },
      Forbidden: {
        description: "Acceso denegado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } }
      },
      NotFound: {
        description: "Recurso no encontrado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } }
      },
      Conflict: {
        description: "Conflicto con el estado actual del recurso",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } }
      }
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { type: "object", additionalProperties: true }
        }
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          detail: { nullable: true },
          traceId: { type: "string", format: "uuid" }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["fullName", "username", "email", "password"],
        properties: {
          fullName: { type: "string", minLength: 3 },
          username: { type: "string", minLength: 3, maxLength: 40 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          confirmPassword: { type: "string", minLength: 8 }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: { type: "string", minLength: 3, description: "Username o email" },
          password: { type: "string" },
          deviceId: { type: "string" },
          platform: { type: "string" }
        }
      },
      RefreshTokenRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: { refreshToken: { type: "string", minLength: 64 } }
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: { email: { type: "string", format: "email" } }
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: { type: "string", minLength: 64 },
          password: { type: "string", minLength: 8 },
          confirmPassword: { type: "string", minLength: 8 }
        }
      },
      CreateUserRequest: {
        allOf: [
          { $ref: "#/components/schemas/RegisterRequest" },
          {
            type: "object",
            properties: {
              roles: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        ]
      },
      CreateRoleRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 60 },
          description: { type: "string" }
        }
      },
      TournamentRequest: {
        type: "object",
        required: ["code", "name"],
        properties: {
          code: { type: "string", minLength: 2, maxLength: 60 },
          name: { type: "string", minLength: 3 },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: tournamentStatuses },
          startDate: { type: "string", format: "date-time", nullable: true },
          endDate: { type: "string", format: "date-time", nullable: true }
        }
      },
      TournamentUpdateRequest: {
        type: "object",
        properties: {
          code: { type: "string", minLength: 2, maxLength: 60 },
          name: { type: "string", minLength: 3 },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: tournamentStatuses },
          startDate: { type: "string", format: "date-time", nullable: true },
          endDate: { type: "string", format: "date-time", nullable: true }
        }
      },
      TeamRequest: {
        type: "object",
        required: ["tournamentId", "code", "name"],
        properties: {
          tournamentId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid", nullable: true },
          code: { type: "string", minLength: 2, maxLength: 60 },
          name: { type: "string", minLength: 2 },
          colorPrimary: { type: "string", nullable: true },
          colorAccent: { type: "string", nullable: true }
        }
      },
      TeamUpdateRequest: {
        type: "object",
        properties: {
          tournamentId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid", nullable: true },
          code: { type: "string", minLength: 2, maxLength: 60 },
          name: { type: "string", minLength: 2 },
          colorPrimary: { type: "string", nullable: true },
          colorAccent: { type: "string", nullable: true }
        }
      },
      PlayerRequest: {
        type: "object",
        required: ["fullName"],
        properties: {
          fullName: { type: "string", minLength: 3 },
          documentNumber: { type: "string", nullable: true },
          birthDate: { type: "string", format: "date-time", nullable: true },
          jerseyName: { type: "string", nullable: true },
          teamId: { type: "string", format: "uuid" },
          jerseyNumber: { type: "integer", minimum: 1 }
        }
      },
      PlayerUpdateRequest: {
        type: "object",
        properties: {
          fullName: { type: "string", minLength: 3 },
          documentNumber: { type: "string", nullable: true },
          birthDate: { type: "string", format: "date-time", nullable: true },
          jerseyName: { type: "string", nullable: true },
          isActive: { type: "boolean" }
        }
      },
      AssignPlayerTeamRequest: {
        type: "object",
        required: ["teamId"],
        properties: {
          teamId: { type: "string", format: "uuid" },
          jerseyNumber: { type: "integer", minimum: 1 }
        }
      },
      MatchRequest: {
        type: "object",
        required: ["code", "tournamentId", "homeTeamId", "awayTeamId"],
        properties: {
          code: { type: "string", minLength: 2, maxLength: 80 },
          tournamentId: { type: "string", format: "uuid" },
          roundId: { type: "string", format: "uuid", nullable: true },
          fieldId: { type: "string", format: "uuid", nullable: true },
          homeTeamId: { type: "string", format: "uuid" },
          awayTeamId: { type: "string", format: "uuid" },
          scheduledAt: { type: "string", format: "date-time", nullable: true },
          notes: { type: "string", nullable: true }
        }
      },
      MatchUpdateRequest: {
        type: "object",
        properties: {
          code: { type: "string", minLength: 2, maxLength: 80 },
          tournamentId: { type: "string", format: "uuid" },
          roundId: { type: "string", format: "uuid", nullable: true },
          fieldId: { type: "string", format: "uuid", nullable: true },
          homeTeamId: { type: "string", format: "uuid" },
          awayTeamId: { type: "string", format: "uuid" },
          scheduledAt: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", enum: matchStatuses },
          homeScore: { type: "integer", minimum: 0 },
          awayScore: { type: "integer", minimum: 0 },
          notes: { type: "string", nullable: true }
        }
      },
      MatchLifecycleRequest: {
        type: "object",
        properties: { clientEventId: { type: "string", minLength: 8 } }
      },
      FinishMatchRequest: {
        type: "object",
        properties: {
          clientEventId: { type: "string", minLength: 8 },
          homeScore: { type: "integer", minimum: 0 },
          awayScore: { type: "integer", minimum: 0 }
        }
      },
      MatchEventRequest: {
        type: "object",
        required: ["clientEventId", "type"],
        properties: {
          clientEventId: { type: "string", minLength: 8 },
          type: { type: "string", enum: matchEventTypes },
          teamId: { type: "string", format: "uuid" },
          playerId: { type: "string", format: "uuid" },
          secondaryPlayerId: { type: "string", format: "uuid" },
          minute: { type: "integer", minimum: 0, maximum: 140 },
          notes: { type: "string", nullable: true },
          payload: { type: "object", additionalProperties: true }
        }
      },
      GoalEventRequest: eventSpecialization(["GOL", "AUTOGOL", "GOL_PENAL"], ["clientEventId", "teamId", "playerId"]),
      CardEventRequest: eventSpecialization(["TARJETA_AMARILLA", "TARJETA_ROJA"], ["clientEventId", "type", "teamId", "playerId"]),
      SubstitutionEventRequest: eventSpecialization(["SUSTITUCION"], [
        "clientEventId",
        "teamId",
        "playerId",
        "secondaryPlayerId"
      ])
    }
  }
};

function reportFilterParams() {
  return [
    queryParam("tournamentId", { type: "string", format: "uuid" }, "Filtra por torneo"),
    queryParam("teamId", { type: "string", format: "uuid" }, "Filtra por equipo"),
    queryParam("playerId", { type: "string", format: "uuid" }, "Filtra por jugador"),
    queryParam("dateFrom", { type: "string", format: "date-time" }, "Fecha inicial"),
    queryParam("dateTo", { type: "string", format: "date-time" }, "Fecha final")
  ];
}

function logPath(summary) {
  return {
    get: {
      tags: ["Logs"],
      summary,
      security: secured,
      parameters: [
        queryParam("page", { type: "integer", minimum: 1, default: 1 }, "Pagina"),
        queryParam("limit", { type: "integer", minimum: 1, maximum: 100, default: 25 }, "Tamano de pagina"),
        queryParam("dateFrom", { type: "string", format: "date-time" }, "Fecha inicial"),
        queryParam("dateTo", { type: "string", format: "date-time" }, "Fecha final"),
        queryParam("userId", { type: "string", format: "uuid" }, "Usuario relacionado"),
        queryParam("action", { type: "string" }, "Accion"),
        queryParam("status", { type: "string" }, "Estado")
      ],
      responses: {
        200: okResponse("Logs listados"),
        403: { $ref: "#/components/responses/Forbidden" }
      }
    }
  };
}

function eventSpecialization(types, required) {
  return {
    type: "object",
    required,
    properties: {
      clientEventId: { type: "string", minLength: 8 },
      type: { type: "string", enum: types },
      teamId: { type: "string", format: "uuid" },
      playerId: { type: "string", format: "uuid" },
      secondaryPlayerId: { type: "string", format: "uuid" },
      minute: { type: "integer", minimum: 0, maximum: 140 },
      notes: { type: "string", nullable: true },
      payload: { type: "object", additionalProperties: true }
    }
  };
}
