import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { testDatabaseConnection } from "../db/pool.js";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    const database = await testDatabaseConnection();

    response.json({
      status: "ok",
      service: "aspace-backend",
      database: {
        connected: true,
        time: database.now
      }
    });
  })
);
