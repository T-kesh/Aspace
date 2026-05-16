import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "ValidationError",
      issues: error.issues
    });
    return;
  }

  const status = typeof error.status === "number" ? error.status : 500;

  response.status(status).json({
    error: status === 500 ? "InternalServerError" : "RequestError",
    message: status === 500 && env.NODE_ENV === "production" ? "Unexpected server error" : error.message
  });
};
