import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { getFallbackAgent, listFallbackAgents, upsertFallbackAgent } from "../services/agentStore.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { agentRegistryContract, parseAgent } from "../services/blockchainService.js";

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
      // 1. Attempt to fetch directly from the blockchain for 100% live state
      const total = Number(await agentRegistryContract.totalAgents());
      const agentsList = [];

      for (let i = 0; i < total; i++) {
        try {
          const addr = await agentRegistryContract.agentAddresses(i);
          const details = await agentRegistryContract.getAgent(addr);
          const parsed = parseAgent(details, addr);

          agentsList.push({
            walletAddress: addr,
            name: parsed.name,
            ownerAddress: parsed.ownerAddress,
            capabilities: parsed.capabilities,
            pricePerTask: parsed.pricePerTask,
            reputation: parsed.reputation,
            tasksCompleted: parsed.tasksCompleted,
            active: parsed.active,
            metadataUri: parsed.description,
            createdAt: new Date(parsed.registrationTime * 1000).toISOString()
          });
        } catch (itemError) {
          // Skip individual failed lookups
        }
      }

      // If blockchain returns agents, serve them
      if (agentsList.length > 0) {
        response.json({ data: agentsList });
        return;
      }
    } catch (blockchainError) {
      console.warn("Blockchain agent listing failed, checking database...", (blockchainError as any).message);
    }

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
      console.warn("Using fallback agent store for GET /agents.", (error as any).message);
      response.json({ data: listFallbackAgents() });
    }
  })
);

agentsRouter.get(
  "/:address",
  asyncHandler(async (request, response) => {
    const address = ethereumAddressSchema.parse(request.params.address);

    try {
      // 1. Query the live blockchain details
      const details = await agentRegistryContract.getAgent(address);
      const parsed = parseAgent(details, address);

      response.json({
        data: {
          walletAddress: address,
          name: parsed.name,
          ownerAddress: parsed.ownerAddress,
          capabilities: parsed.capabilities,
          pricePerTask: parsed.pricePerTask,
          reputation: parsed.reputation,
          tasksCompleted: parsed.tasksCompleted,
          active: parsed.active,
          metadataUri: parsed.description,
          createdAt: new Date(parsed.registrationTime * 1000).toISOString()
        }
      });
      return;
    } catch (blockchainError) {
      console.warn(`Blockchain lookup failed for agent ${address}:`, (blockchainError as any).message);
    }

    try {
      const result = await pool.query("SELECT * FROM agents WHERE lower(wallet_address) = lower($1)", [address]);

      if (result.rowCount === 0) {
        response.status(404).json({ error: "AgentNotFound" });
        return;
      }

      response.json({ data: mapAgent(result.rows[0]) });
    } catch (error) {
      console.warn("Using fallback agent store for GET /agents/:address.", (error as any).message);
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
      // Attempt to verify if the agent is registered on-chain first
      let onChainRep = 100;
      let onChainCompleted = 0;

      try {
        const details = await agentRegistryContract.getAgent(input.walletAddress);
        const parsed = parseAgent(details, input.walletAddress);
        onChainRep = parsed.reputation;
        onChainCompleted = parsed.tasksCompleted;
      } catch (e) {
        // If not registered on-chain, allow registration in DB anyway (post-sync workflow)
      }

      const result = await pool.query(
        `INSERT INTO agents (
           wallet_address,
           name,
           owner_address,
           capabilities,
           price_per_task,
           metadata_uri,
           reputation,
           tasks_completed
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (wallet_address)
         DO UPDATE SET
           name = EXCLUDED.name,
           owner_address = EXCLUDED.owner_address,
           capabilities = EXCLUDED.capabilities,
           price_per_task = EXCLUDED.price_per_task,
           metadata_uri = EXCLUDED.metadata_uri,
           reputation = EXCLUDED.reputation,
           tasks_completed = EXCLUDED.tasks_completed,
           active = TRUE,
           updated_at = NOW()
         RETURNING *`,
        [
          input.walletAddress,
          input.name,
          input.ownerAddress ?? null,
          input.capabilities,
          input.pricePerTask,
          input.metadataUri ?? null,
          onChainRep,
          onChainCompleted
        ]
      );

      response.status(201).json({ data: mapAgent(result.rows[0]) });
    } catch (error) {
      console.warn("Using fallback agent store for POST /agents.", (error as any).message);
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
