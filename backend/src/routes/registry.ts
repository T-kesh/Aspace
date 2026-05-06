import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { queryFallbackAgents } from "../services/agentStore.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registryRouter = Router();

const registryQuerySchema = z.object({
  capability: z.string().min(1),
  minReputation: z.coerce.number().int().min(0).max(100).default(20),
  maxPrice: z.coerce.number().nonnegative().optional()
});

registryRouter.get(
  "/query",
  asyncHandler(async (request, response) => {
    const query = registryQuerySchema.parse(request.query);

    const values: Array<string | number> = [query.capability, query.minReputation];
    const maxPriceFilter = query.maxPrice === undefined ? "" : "AND price_per_task <= $3";

    if (query.maxPrice !== undefined) {
      values.push(query.maxPrice);
    }

    try {
      const result = await pool.query(
        `SELECT *
         FROM agents
         WHERE active = TRUE
           AND $1 = ANY(capabilities)
           AND reputation >= $2
           ${maxPriceFilter}
         ORDER BY reputation DESC, tasks_completed DESC, price_per_task ASC`,
        values
      );

      response.json({
        data: result.rows.map((row) => ({
          walletAddress: row.wallet_address,
          name: row.name,
          capabilities: row.capabilities,
          pricePerTask: Number(row.price_per_task),
          reputation: row.reputation,
          metadataUri: row.metadata_uri
        }))
      });
    } catch (error) {
      console.warn("Using fallback agent store for GET /registry/query.", error);
      response.json({
        data: queryFallbackAgents({
          capability: query.capability,
          minReputation: query.minReputation,
          maxPrice: query.maxPrice
        })
      });
    }
  })
);
