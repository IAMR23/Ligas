import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { openApiSpec } from "./docs/openapi.js";
import { attachTraceId } from "./middlewares/audit.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { fieldsRouter } from "./modules/fields/fields.routes.js";
import { logsRouter } from "./modules/logs/logs.routes.js";
import { matchEventsRouter } from "./modules/match-events/match-events.routes.js";
import { matchesRouter } from "./modules/matches/matches.routes.js";
import { playersRouter } from "./modules/players/players.routes.js";
import { publicRouter } from "./modules/public/public.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";
import { rolesRouter } from "./modules/roles/roles.routes.js";
import { standingsRouter } from "./modules/standings/standings.routes.js";
import { teamsRouter } from "./modules/teams/teams.routes.js";
import { tournamentsRouter } from "./modules/tournaments/tournaments.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "3mb" }));
app.use(morgan("dev"));
app.use(attachTraceId);

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Backend LigaFutbol MVP activo",
    data: { service: "backend" }
  });
});

app.get("/api/docs.json", (_req, res) => {
  res.json(openApiSpec);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/api/public/onboarding", (_req, res) => {
  res.json({
    success: true,
    message: "Onboarding publico disponible",
    data: {
      appName: "LigaFutbol MVP",
      features: ["Torneos", "Equipos", "Partidos", "Estadisticas", "Reportes", "Registro offline"]
    }
  });
});

app.use("/api/public", publicRouter);

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/tournaments", tournamentsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/fields", fieldsRouter);
app.use("/api/matches/:id/events", matchEventsRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/standings", standingsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/logs", logsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
