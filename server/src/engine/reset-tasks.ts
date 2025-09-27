import { eq } from "drizzle-orm";
import { db } from "../db/db";
import {
  systemState,
  tasks,
  userGoals,
  userMetrics,
  userTasks,
} from "../db/schema";
import { BadRequestError, NotFoundError } from "../config/error";

export const resetUserTasks = async (userId: string) => {
  if (!userId) throw new BadRequestError("userId required");

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const prevDayDateOnly = new Date(todayStart);
  prevDayDateOnly.setDate(prevDayDateOnly.getDate() - 1);
  const prevDayISODateOnly = prevDayDateOnly.toISOString().slice(0, 10);

  await db.transaction(async (tx) => {
    const [sysRow] = await tx
      .select()
      .from(systemState)
      .where(eq(systemState.id, userId));

    if (!sysRow) {
      throw new NotFoundError(`systemState not found for user ${userId}`);
    }

    if (!(sysRow.lastRefresh < todayStart)) {
      return;
    }

    const goals = await tx
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId));

    if (goals.length > 0) {
      const metricsBulk = goals.map((g) => ({
        userId,
        date: prevDayISODateOnly,
        goalType: g.goalType,
        value: g.currentValue,
        unit: g.unit,
      }));

      await tx.insert(userMetrics).values(metricsBulk);

      await tx
        .update(userGoals)
        .set({
          currentValue: 0,
        })
        .where(eq(userGoals.userId, userId));
    }

    await tx
      .update(userTasks)
      .set({
        ignores: 0,
        status: "pending",
      })
      .where(eq(userTasks.userId, userId));

    await tx
      .update(systemState)
      .set({
        lastRefresh: now,
      })
      .where(eq(systemState.id, userId));
  });
};
