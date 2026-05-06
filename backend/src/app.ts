import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsOrigins, env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { agentsRouter } from "./routes/agents.js";
import { healthRouter } from "./routes/health.js";
import { registryRouter } from "./routes/registry.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(`${env.API_BASE_PATH}/health`, healthRouter);
app.use(`${env.API_BASE_PATH}/agents`, agentsRouter);
app.use(`${env.API_BASE_PATH}/registry`, registryRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "RouteNotFound" });
});

app.use(errorHandler);
