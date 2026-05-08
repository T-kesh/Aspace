import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fallback in-memory task store
type TaskInput = {
  clientAddress: string;
  providerAddress: string;
  amount: number;
  taskData: string;
};

type Task = TaskInput & {
  id: string;
  taskOutput: string | null;
  status: string;
  createdAt: string;
  fundedAt: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
  paidAt: string | null;
};

const fallbackTasks = new Map<string, Task>();

export const tasksRouter = Router();

const ethereumAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Expected a valid Ethereum address");

const taskCreateSchema = z.object({
  clientAddress: ethereumAddressSchema,
  providerAddress: ethereumAddressSchema,
  amount: z.coerce.number().nonnegative(),
  taskData: z.string().min(1),
});

const taskSubmitSchema = z.object({
  output: z.string().min(1),
});

function mapTask(row: Record<string, unknown>) {
  return {
    id: row.id,
    clientAddress: row.client_address,
    providerAddress: row.provider_address,
    amount: Number(row.amount),
    taskData: row.task_data,
    taskOutput: row.task_output,
    status: row.status,
    fundedAt: row.funded_at,
    completedAt: row.completed_at,
    verifiedAt: row.verified_at,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

tasksRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const input = taskCreateSchema.parse(request.body);

    try {
      const result = await pool.query(
        `INSERT INTO tasks (
           client_address,
           provider_address,
           amount,
           task_data,
           status
         )
         VALUES ($1, $2, $3, $4, 'created')
         RETURNING *`,
        [input.clientAddress, input.providerAddress, input.amount, input.taskData]
      );

      response.status(201).json({ data: mapTask(result.rows[0]) });
    } catch (error) {
      console.warn("Using fallback task store for POST /tasks.", error);
      const task: Task = {
        id: `task-${Date.now()}`,
        clientAddress: input.clientAddress,
        providerAddress: input.providerAddress,
        amount: input.amount,
        taskData: input.taskData,
        taskOutput: null,
        status: "created",
        createdAt: new Date().toISOString(),
        fundedAt: null,
        completedAt: null,
        verifiedAt: null,
        paidAt: null
      };
      fallbackTasks.set(task.id, task);
      response.status(201).json({ data: task });
    }
  })
);

tasksRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const limit = Math.min(Number(request.query.limit) || 100, 1000);
    const offset = Math.max(Number(request.query.offset) || 0, 0);
    const clientAddress = typeof request.query.client === "string" ? request.query.client : undefined;
    const providerAddress = typeof request.query.provider === "string" ? request.query.provider : undefined;

    try {
      let whereClause = "";
      const values: (string | number)[] = [];
      let paramIndex = 1;

      if (clientAddress) {
        whereClause += ` WHERE client_address = $${paramIndex}`;
        values.push(clientAddress);
        paramIndex++;
      } else if (providerAddress) {
        whereClause += ` WHERE provider_address = $${paramIndex}`;
        values.push(providerAddress);
      }

      const query = `
        SELECT *
        FROM tasks
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      values.push(limit, offset);

      const result = await pool.query(query, values);

      response.json({
        data: result.rows.map(mapTask),
        meta: {
          total: result.rowCount,
          limit,
          offset,
        },
      });
    } catch (error) {
      console.warn("Using fallback task store for GET /tasks.", error);
      let tasks = [...fallbackTasks.values()];
      
      if (clientAddress) {
        tasks = tasks.filter(t => t.clientAddress === clientAddress);
      } else if (providerAddress) {
        tasks = tasks.filter(t => t.providerAddress === providerAddress);
      }
      
      tasks = tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const paginatedTasks = tasks.slice(offset, offset + limit);
      
      response.json({
        data: paginatedTasks,
        meta: {
          total: tasks.length,
          limit,
          offset,
        },
      });
    }
  })
);

tasksRouter.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const idSchema = z.coerce.number().int().positive();
    const taskId = idSchema.parse(request.params.id);

    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [taskId]);

    if (result.rowCount === 0) {
      response.status(404).json({ error: "TaskNotFound" });
      return;
    }

    response.json({ data: mapTask(result.rows[0]) });
  })
);

tasksRouter.post(
  "/:id/submit",
  asyncHandler(async (request, response) => {
    const idSchema = z.coerce.number().int().positive();
    const taskId = idSchema.parse(request.params.id);
    const input = taskSubmitSchema.parse(request.body);

    try {
      const result = await pool.query(
        `UPDATE tasks
         SET task_output = $1, status = 'completed', completed_at = NOW()
         WHERE id = $2 AND status = 'funded'
         RETURNING *`,
        [input.output, taskId]
      );

      if (result.rowCount === 0) {
        response.status(404).json({ error: "TaskNotFoundOrInvalidStatus" });
        return;
      }

      response.json({ data: mapTask(result.rows[0]) });
    } catch (error) {
      console.warn("Database error for POST /tasks/:id/submit.", error);
      response.status(500).json({ error: "DatabaseError" });
    }
  })
);
