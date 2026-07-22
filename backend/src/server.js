import "dotenv/config";
import { env } from "./config/env.js";
import app from "./app.js";

const port = env.port;

const server = app.listen(port, () => {
  console.log(`LigaFutbol MVP backend escuchando en http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("No se pudo iniciar el servidor", error);
  process.exit(1);
});
