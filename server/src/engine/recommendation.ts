import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { tasks, userTasks, userGoals } from "../db/schema";
import {
  DefaultSuperGoals,
  Metrics,
  ScoredTask,
  SuperGoals,
  Task,
  TodayState,
} from "./types";
import { ScoringEngine } from "./scoring";
import { userSuperGoals } from "../db/schema/user_supergoals";

type TaskRow = typeof tasks.$inferSelect;
type UserTaskRow = typeof userTasks.$inferSelect;
type UserGoalsRow = typeof userGoals.$inferSelect;

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function isRecentlyIgnored(
  ut: UserTaskRow | null | undefined,
  now: Date
): boolean {
  if (!ut) return false;
  if (ut.status !== "ignore") return false;
  if ((ut.ignores ?? 0) <= 0) return false;
  if (!ut.lastDismissal) return false;
  const ld = toDate(ut.lastDismissal as any);
  if (!ld) return false;
  return now.getTime() - ld.getTime() <= TWO_HOURS_MS;
}

function isDismissBlocked(
  ut: UserTaskRow | null | undefined,
  now: Date
): boolean {
  if (!ut) return false;
  if (ut.status !== "dismiss") return false;
  if (!ut.lastDismissal) return false;
  const ld = toDate(ut.lastDismissal as any);
  if (!ld) return false;
  return now.getTime() - ld.getTime() <= ONE_DAY_MS;
}

function isRecentlyCompleted(
  ut: UserTaskRow | null | undefined,
  now: Date
): boolean {
  if (!ut) return false;
  const lc = toDate(ut.lastCompletion as any);
  if (!lc) return false;
  return now.getTime() - lc.getTime() <= TWO_HOURS_MS;
}

export class RecommendationEngine {
  public static async get_user_metrics(userId: string): Promise<Metrics> {
    const user_goals = (await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))) as UserGoalsRow[];

    const metrics: Metrics = {
      waterMl: 0,
      steps: 0,
      sleepHours: 0,
      screenTimeMin: 0,
      mood1to5: 0,
    };

    for (const g of user_goals) {
      switch (g.goalType) {
        case "hydration":
          metrics.waterMl = g.currentValue;
          break;
        case "mood":
          metrics.mood1to5 = g.currentValue;
          break;
        case "screen":
          metrics.screenTimeMin = g.currentValue;
          break;
        case "movement":
          metrics.steps = g.currentValue;
          break;
        case "sleep":
          metrics.sleepHours = g.currentValue;
          break;
      }
    }

    return metrics;
  }

  public static async recommend_tasks(
    userId: string,
    len: number,
    now: Date
  ): Promise<ScoredTask[]> {
    const userMetrics = await this.get_user_metrics(userId);

    const result = await db.transaction(async (tx) => {
      const utRows = (await tx
        .select()
        .from(userTasks)
        .innerJoin(tasks, eq(tasks.id, userTasks.taskId))
        .where(eq(userTasks.userId, userId))) as Array<{
        user_tasks: UserTaskRow;
        tasks: TaskRow;
      }>;

      const [uSuperGoals] = await tx
        .select()
        .from(userSuperGoals)
        .where(eq(userSuperGoals.userId, userId))
        .orderBy(desc(userSuperGoals.createdAt));

      const mainRows = utRows.filter((r) => r.tasks.isMain);

      const referencedIds = new Set<string>();
      for (const r of mainRows) {
        if (r.tasks.alternativeTask) referencedIds.add(r.tasks.alternativeTask);
        if (r.tasks.microTask) referencedIds.add(r.tasks.microTask);
      }

      const referencedArray = Array.from(referencedIds);
      const referencedRows = referencedArray.length
        ? ((await tx
            .select()
            .from(tasks)
            .leftJoin(userTasks, eq(userTasks.taskId, tasks.id))
            .where(inArray(tasks.id, referencedArray))) as Array<{
            tasks: TaskRow;
            user_tasks: UserTaskRow | null;
          }>)
        : [];

      const refMap = new Map<
        string,
        { task: TaskRow; userTask: UserTaskRow | null }
      >();
      for (const r of referencedRows) {
        refMap.set(r.tasks.id, {
          task: r.tasks,
          userTask: r.user_tasks ?? null,
        });
      }

      type Normalized = { task: TaskRow; userTask: UserTaskRow | null };
      const candidates: Normalized[] = [];
      const added = new Set<string>();

      for (const row of mainRows) {
        const mainTask = row.tasks;
        const mainUserTask = row.user_tasks ?? null;

        const mainIgnored = isRecentlyIgnored(mainUserTask, now);
        const mainDismissBlocked = isDismissBlocked(mainUserTask, now);
        const mainCompleted = isRecentlyCompleted(mainUserTask, now);

        if (!mainIgnored && !mainDismissBlocked && !mainCompleted) {
          if (!added.has(mainTask.id)) {
            added.add(mainTask.id);
            candidates.push({ task: mainTask, userTask: mainUserTask });
          }
          continue;
        }

        let pushed = false;

        if (mainTask.alternativeTask) {
          const alt = refMap.get(mainTask.alternativeTask);
          const altUser = alt?.userTask ?? null;
          if (
            alt &&
            !isRecentlyIgnored(altUser, now) &&
            !isDismissBlocked(altUser, now) &&
            !isRecentlyCompleted(altUser, now) &&
            !added.has(alt.task.id)
          ) {
            added.add(alt.task.id);
            candidates.push({ task: alt.task, userTask: altUser });
            pushed = true;
          }
        }

        if (!pushed && mainTask.microTask) {
          const mic = refMap.get(mainTask.microTask);
          const micUser = mic?.userTask ?? null;
          if (
            mic &&
            !isRecentlyIgnored(micUser, now) &&
            !isDismissBlocked(micUser, now) &&
            !isRecentlyCompleted(micUser, now) &&
            !added.has(mic.task.id)
          ) {
            added.add(mic.task.id);
            candidates.push({ task: mic.task, userTask: micUser });
            pushed = true;
          }
        }

        if (
          !pushed &&
          !mainCompleted &&
          !mainDismissBlocked &&
          !added.has(mainTask.id)
        ) {
          added.add(mainTask.id);
          candidates.push({ task: mainTask, userTask: mainUserTask });
        }
      }

      const scored: ScoredTask[] = candidates.map(
        ({ task: t, userTask: ut }) => {
          const task: Task = {
            id: t.id,
            title: t.title,
            category: t.category,
            impactWeight: t.impactWeight,
            effortMin: t.effortMin,
            timeGate: t.timegate,
          };

          const todayState: TodayState = {
            ignores: ut?.ignores ?? 0,
            completedToday: ut?.status === "complete",
            lastCompletion: ut?.lastCompletion ?? null,
          };

          const superGoals: SuperGoals = {
            hydration:
              Number(userSuperGoals.hydration) ?? DefaultSuperGoals.hydration,
            sleep: Number(userSuperGoals.sleep) ?? DefaultSuperGoals.sleep,
            screen: Number(userSuperGoals.screen) ?? DefaultSuperGoals.screen,
            mood: Number(userSuperGoals.mood) ?? DefaultSuperGoals.mood,
            movement:
              Number(userSuperGoals.movement) ?? DefaultSuperGoals.movement,
          };

          const score = ScoringEngine.computeScore(
            task,
            todayState,
            userMetrics,
            superGoals,
            now
          );

          return { id: task.id, score, base: task };
        }
      );

      const sorted = scored.sort((a, b) => b.score - a.score).slice(0, len);
      return sorted;
    });

    return result;
  }
}
