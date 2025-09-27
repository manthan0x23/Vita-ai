import { Request, Response } from "express";
import {
  AppError,
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "../../config/error";
import { updateTaskInput } from "./dtos/dismiss-task.dto";
import { db } from "../../db/db";
import { taskHistory, tasks, userGoals, userTasks } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

async function getUserTaskWithTask(
  tx: PgTransaction<any, any, any> | PostgresJsDatabase<any>,
  userId: string,
  taskId: string
) {
  const rows = (await tx
    .select()
    .from(userTasks)
    .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)))
    .innerJoin(tasks, eq(tasks.id, taskId))) as Array<{
    tasks: typeof tasks.$inferSelect;
    user_tasks: typeof userTasks.$inferSelect;
  }>;

  if (!rows || rows.length === 0) {
    throw new BadRequestError("Task not found for the user");
  }
  return rows[0];
}

export const updateTaskStatusHandler = async (req: Request, res: Response) => {
  const parsed = updateTaskInput.safeParse(req.body);
  if (parsed.error) throw new BadRequestError(parsed.error.message);

  const { action, taskId } = parsed.data;

  if (!req.user) throw new UnauthorizedError("User must be logged in!");

  const userId = req.user as string;

  try {
    await db.transaction(async (tx) => {
      const { tasks: t, user_tasks: ut } = await getUserTaskWithTask(
        tx,
        userId,
        taskId
      );
      const now = new Date();

      const historyAction =
        action === "completed"
          ? "complete"
          : action === "ignore"
          ? "ignore"
          : "dismiss";

      await tx.insert(taskHistory).values({
        userId: ut.userId,
        taskId: ut.taskId,
        action: historyAction,
      });

      switch (action) {
        case "completed": {
          const [userGoal] = await tx
            .selectDistinct()
            .from(userGoals)
            .where(
              and(
                eq(userGoals.goalType, t.category),
                eq(userGoals.userId, ut.userId)
              )
            );

          if (userGoal) {
            await tx
              .update(userGoals)
              .set({
                currentValue: userGoal.currentValue + (t.reward ?? 0),
              })
              .where(
                and(
                  eq(userGoals.goalType, t.category),
                  eq(userGoals.userId, ut.userId)
                )
              );
          }

          await tx
            .update(userTasks)
            .set({
              lastCompletion: now,
              status: "pending",
            })
            .where(eq(userTasks.id, ut.id));
          break;
        }

        case "ignore": {
          await tx
            .update(userTasks)
            .set({
              lastDismissal: now,
              status: "ignore",
              ignores: ut.ignores + 1,
            })
            .where(eq(userTasks.id, ut.id));
          break;
        }

        case "dismiss": {
          await tx
            .update(userTasks)
            .set({
              status: "dismiss",
              lastDismissal: new Date(),
            })
            .where(eq(userTasks.id, ut.id));
          break;
        }

        default:
          throw new BadRequestError("Unknown action");
      }
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new InternalServerError(
      "An unexpected error occurred while updating the task status."
    );
  }
};
