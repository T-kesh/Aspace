import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { getFallbackAgent, listFallbackAgents, upsertFallbackAgent } from "../services/agentStore.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const agentsRouter = Router();

const ethereumAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Expected a valid Ethereum address");

const agentCreateSchema = z.object({
  walletAddress: ethereumAddressSchema,
  name: z.string().min(2).max(120),
  ownerAddress: ethereumAddressSchema.optional(),
  capabilities: z.array(z.string().min(1).max(60)).min(1),
  pricePerTask: z.coerce.number().nonnegative(),
  metadataUri: z.string().max(500).optional()
});

function mapAgent(row: Record<string, unknown>) {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    name: row.name,
    ownerAddress: row.owner_address,
    capabilities: row.capabilities,
    pricePerTask: Number(row.price_per_task),
    reputation: row.reputation,
    tasksCompleted: row.tasks_completed,
    tasksFailed: row.tasks_failed,
    active: row.active,
    metadataUri: row.metadata_uri,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

agentsRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    try {
      const result = await pool.query(
        `SELECT *
         FROM agents
         WHERE active = TRUE
         ORDER BY reputation DESC, tasks_completed DESC, created_at DESC`
      );

      response.json({
        data: result.rows.map(mapAgent)
      });
    } catch (error) {
      console.warn("Using fallback agent store for GET /agents.", error);
      response.json({ data: listFallbackAgents() });
    }
  })
);

agentsRouter.get(
  "/:address",
  asyncHandler(async (request, response) => {
    const address = ethereumAddressSchema.parse(request.params.address);
    try {
      const result = await pool.query("SELECT * FROM agents WHERE lower(wallet_address) = lower($1)", [address]);

      if (result.rowCount === 0) {
        response.status(404).json({ error: "AgentNotFound" });
        return;
      }

      response.json({ data: mapAgent(result.rows[0]) });
    } catch (error) {
      console.warn("Using fallback agent store for GET /agents/:address.", error);
      const agent = getFallbackAgent(address);

      if (!agent) {
        response.status(404).json({ error: "AgentNotFound" });
        return;
      }

      response.json({ data: agent });
    }
  })
);

agentsRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const input = agentCreateSchema.parse(request.body);

    try {
      const result = await pool.query(
        `INSERT INTO agents (
           wallet_address,
           name,
           owner_address,
           capabilities,
           price_per_task,
           metadata_uri
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (wallet_address)
         DO UPDATE SET
           name = EXCLUDED.name,
           owner_address = EXCLUDED.owner_address,
           capabilities = EXCLUDED.capabilities,
           price_per_task = EXCLUDED.price_per_task,
           metadata_uri = EXCLUDED.metadata_uri,
           active = TRUE,
           updated_at = NOW()
         RETURNING *`,
        [
          input.walletAddress,
          input.name,
          input.ownerAddress ?? null,
          input.capabilities,
          input.pricePerTask,
          input.metadataUri ?? null
        ]
      );

      response.status(201).json({ data: mapAgent(result.rows[0]) });
    } catch (error) {
      console.warn("Using fallback agent store for POST /agents.", error);
      response.status(201).json({
        data: upsertFallbackAgent({
          walletAddress: input.walletAddress,
          name: input.name,
          ownerAddress: input.ownerAddress ?? null,
          capabilities: input.capabilities,
          pricePerTask: input.pricePerTask,
          metadataUri: input.metadataUri ?? null
        })
      });
    }
  })
);
