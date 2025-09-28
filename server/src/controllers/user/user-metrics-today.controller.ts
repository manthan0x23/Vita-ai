import { Request, Response } from "express";
import {
  AppError,
  BadRequestError,
  InternalServerError,
} from "../../config/error";
import { db } from "../../db/db";
import { userMetrics } from "../../db/schema/user_metrics";
import { userSuperGoals } from "../../db/schema/user_supergoals";
import { userGoals } from "../../db/schema";
import { taskHistory } from "../../db/schema/task_history";
import { eq, sql, and } from "drizzle-orm";

function toISODateString(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().split("T")[0];
}

interface GoalProgress {
  goalType: string;
  consumption: number;
  target: number;
  progress: number;
}

interface TaskHistoryRates {
  dismissalRate: number;
  completionRate: number;
  ignoreRate: number;
}

export const userMetricsTodayHandler = async (
  req: Request,
  res: Response
): Promise<
  Response<{
    message: string;
    date: string;
    goals: GoalProgress[];
    taskHistoryRates: TaskHistoryRates;
  }>
> => {
  if (!req.user) {
    throw new BadRequestError("User ID is missing from request.");
  }

  try {
    const todayStr = toISODateString(new Date());

    return await db.transaction(async (tx) => {
      const [superGoals] = await tx
        .select()
        .from(userSuperGoals)
        .where(eq(userSuperGoals.userId, req.user!));

      if (!superGoals) {
        throw new BadRequestError("User super goals not found.");
      }

      const aggregated = await tx
        .select({
          goalType: userGoals.goalType,
          consumption: sql<number>`SUM(${userGoals.currentValue})`.as(
            "consumption"
          ),
        })
        .from(userGoals)
        .where(eq(userGoals.userId, req.user!))
        .groupBy(userGoals.goalType);

      const goals: GoalProgress[] = aggregated.map((row) => {
        const target = (() => {
          switch (row.goalType) {
            case "hydration":
              return superGoals.hydration * 1000;
            case "movement":
              return superGoals.movement;
            case "sleep":
              return superGoals.sleep;
            case "screen":
              return superGoals.screen;
            case "mood":
              return superGoals.mood;
            default:
              return 0;
          }
        })();

        let consumption = Number(row.consumption ?? 0);
        if (row.goalType === "hydration") {
          consumption *= 1000;
        }

        const progress =
          target > 0
            ? Math.min(100, Math.round((consumption / target) * 100))
            : 0;

        return {
          goalType: row.goalType,
          consumption,
          target,
          progress,
        };
      });

      const todayTaskHistory = await tx
        .select({
          action: taskHistory.action,
          count: sql<number>`COUNT(*)`.as("count"),
        })
        .from(taskHistory)
        .where(
          and(
            eq(taskHistory.userId, req.user!),
            sql`DATE(${taskHistory.createdAt}) = ${todayStr}`
          )
        )
        .groupBy(taskHistory.action);

      let totalTasks = 0;
      let dismissal = 0;
      let completion = 0;
      let ignore = 0;

      todayTaskHistory.forEach((row) => {
        const c = Number(row.count ?? 0);
        totalTasks += c;
        switch (row.action) {
          case "dismiss":
            dismissal = c;
            break;
          case "complete":
            completion = c;
            break;
          case "ignore":
            ignore = c;
            break;
        }
      });

      const taskHistoryRates: TaskHistoryRates = {
        dismissalRate:
          totalTasks > 0 ? Math.round((dismissal / totalTasks) * 100) : 0,
        completionRate:
          totalTasks > 0 ? Math.round((completion / totalTasks) * 100) : 0,
        ignoreRate:
          totalTasks > 0 ? Math.round((ignore / totalTasks) * 100) : 0,
      };

      return res.status(200).json({
        message:
          "Today's user metrics and task history rates fetched successfully",
        date: todayStr,
        goals,
        taskHistoryRates,
      });
    });
  } catch (error: any) {
    console.error("userMetricsTodayHandler error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new InternalServerError(
      "An unexpected error occurred while fetching today's user metrics."
    );
  }
};
