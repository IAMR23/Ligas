import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { attachTraceId } from "./middlewares/audit.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { matchEventsRouter } from "./modules/match-events/match-events.routes.js";
import { matchesRouter } from "./modules/matches/matches.routes.js";
import { playersRouter } from "./modules/players/players.routes.js";
import { rolesRouter } from "./modules/roles/roles.routes.js";
import { teamsRouter } from "./modules/teams/teams.routes.js";
import { tournamentsRouter } from "./modules/tournaments/tournaments.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan("dev"));
app.use(attachTraceId);

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Backend LigaFutbol MVP activo",
    data: { service: "backend" }
  });
});

app.get("/api/docs", (_req, res) => {
  res.json({
    success: true,
    message: "Swagger/OpenAPI se implementara en la fase de API",
    data: { title: "LigaFutbol MVP API" }
  });
});

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

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/tournaments", tournamentsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/matches/:id/events", matchEventsRouter);
app.use("/api/matches", matchesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
