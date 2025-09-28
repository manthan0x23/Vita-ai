import { Request, Response } from "express";
import {
  AppError,
  BadRequestError,
  InternalServerError,
} from "../../config/error";
import { userMetricsInput } from "./dtos/user-metrics.dto";
import { db } from "../../db/db";
import { userSuperGoals } from "../../db/schema/user_supergoals";
import { userMetrics } from "../../db/schema/user_metrics";
import { taskHistory } from "../../db/schema/task_history";
import { eq, desc, sql, gte, lte, and, count } from "drizzle-orm";

interface GoalPerPage {
  type: string;
  progress: string;
  consumption: number;
}

interface TaskHistoryStats {
  dismissalRate: number;
  completionRate: number;
  ignoreRate: number;
}

interface Page {
  date: Date;
  progress: number;
  goals: GoalPerPage[];
  taskStats: TaskHistoryStats;
}

interface Result {
  message: string;
  data: Page[];
  totalPages: number;
  totalEntries: number;
  page: number;
  perPage: number;
}

function toISODateString(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().split("T")[0];
}

export const userMetricsHandler = async (
  req: Request,
  res: Response
): Promise<Response<Result>> => {
  const input = userMetricsInput.safeParse(req.query);

  if (!input.success) {
    throw new BadRequestError(input.error.message);
  }

  if (!req.user) {
    throw new BadRequestError("User ID is missing from request.");
  }

  const { page, perPage } = input.data;
  if (page < 1 || perPage < 1) {
    throw new BadRequestError("page and perPage must be >= 1");
  }

  try {
    const offset = (page - 1) * perPage;

    const pages: Page[] = [];
    let totalPages = 0;

    await db.transaction(async (tx) => {
      // fetch user super goals
      const [superGoals] = await tx
        .select()
        .from(userSuperGoals)
        .where(eq(userSuperGoals.userId, req.user!));

      if (!superGoals) {
        throw new BadRequestError("User goals not found");
      }

      // total entries (distinct dates)
      const totalDatesRow = await tx
        .select({
          cnt: sql<number>`COUNT(DISTINCT ${userMetrics.date})`.as("cnt"),
        })
        .from(userMetrics)
        .where(eq(userMetrics.userId, req.user!));

      const totalDates = (totalDatesRow && totalDatesRow[0]?.cnt) || 0;
      totalPages = Math.max(0, Math.ceil(totalDates / perPage));

      // find distinct dates for this page
      const distinctDatesRows = await tx
        .selectDistinct({ date: userMetrics.date })
        .from(userMetrics)
        .where(eq(userMetrics.userId, req.user!))
        .orderBy(desc(userMetrics.date))
        .limit(perPage)
        .offset(offset);

      const datesList = distinctDatesRows
        .map((r) => toISODateString(r.date))
        .filter(Boolean);

      if (datesList.length === 0) {
        return;
      }

      const maxDateStr = datesList[0];
      const minDateStr = datesList[datesList.length - 1];

      // aggregate metrics per goal per date
      const aggregated = await tx
        .select({
          date: userMetrics.date,
          goalType: userMetrics.goalType,
          consumption: sql<number>`SUM(${userMetrics.value})`.as("consumption"),
        })
        .from(userMetrics)
        .where(
          and(
            eq(userMetrics.userId, req.user!),
            gte(userMetrics.date, minDateStr),
            lte(userMetrics.date, maxDateStr)
          )
        )
        .groupBy(userMetrics.date, userMetrics.goalType)
        .orderBy(desc(userMetrics.date));

      const grouped = new Map<string, GoalPerPage[]>();
      for (const row of aggregated) {
        const dateKey = toISODateString(row.date);
        if (!datesList.includes(dateKey)) continue;

        const target = (() => {
          switch (row.goalType) {
            case "hydration":
              return superGoals.hydration;
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

        const consumption = Number(row.consumption ?? 0);
        const progressPct =
          target > 0
            ? Math.min(100, Math.round((consumption / target) * 100))
            : 0;

        const g: GoalPerPage = {
          type: row.goalType,
          progress: `${progressPct}%`,
          consumption,
        };

        if (!grouped.has(dateKey)) grouped.set(dateKey, []);
        grouped.get(dateKey)!.push(g);
      }

      // --- fetch task history stats ---
      const taskAgg = await tx
        .select({
          date: sql<string>`DATE(${taskHistory.createdAt})`.as("date"),
          action: taskHistory.action,
          cnt: count().as("cnt"),
        })
        .from(taskHistory)
        .where(
          and(
            eq(taskHistory.userId, req.user!),
            gte(taskHistory.createdAt, new Date(minDateStr)),
            lte(taskHistory.createdAt, new Date(maxDateStr))
          )
        )
        .groupBy(sql`DATE(${taskHistory.createdAt})`, taskHistory.action);

      const taskGrouped = new Map<
        string,
        { dismissal: number; completion: number; ignore: number; total: number }
      >();

      for (const row of taskAgg) {
        const dateKey = row.date;
        if (!datesList.includes(dateKey)) continue;

        if (!taskGrouped.has(dateKey)) {
          taskGrouped.set(dateKey, {
            dismissal: 0,
            completion: 0,
            ignore: 0,
            total: 0,
          });
        }
        const bucket = taskGrouped.get(dateKey)!;

        switch (row.action) {
          case "dismiss":
            bucket.dismissal += Number(row.cnt);
            break;
          case "complete":
            bucket.completion += Number(row.cnt);
            break;
          case "ignore":
            bucket.ignore += Number(row.cnt);
            break;
        }
        bucket.total += Number(row.cnt);
      }

      // build final pages
      for (const dateStr of datesList) {
        const goals = grouped.get(dateStr) ?? [];

        const totalPct = goals.reduce(
          (sum, gg) => sum + parseInt(gg.progress.replace("%", ""), 10),
          0
        );
        const avgProgress =
          goals.length > 0 ? Math.round(totalPct / goals.length) : 0;

        const hist = taskGrouped.get(dateStr);
        const taskStats: TaskHistoryStats = {
          dismissalRate:
            hist && hist.total > 0
              ? Math.round((hist.dismissal / hist.total) * 100)
              : 0,
          completionRate:
            hist && hist.total > 0
              ? Math.round((hist.completion / hist.total) * 100)
              : 0,
          ignoreRate:
            hist && hist.total > 0
              ? Math.round((hist.ignore / hist.total) * 100)
              : 0,
        };

        pages.push({
          date: new Date(dateStr),
          progress: avgProgress,
          goals,
          taskStats,
        });
      }
    });

    return res.status(200).json({
      message: "User metrics fetched successfully",
      data: pages,
      totalEntries: pages.length,
      totalPages,
      page,
      perPage,
    });
  } catch (error: any) {
    console.error("userMetricsHandler error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new InternalServerError(
      "An unexpected error occurred while fetching user metrics."
    );
  }
};
