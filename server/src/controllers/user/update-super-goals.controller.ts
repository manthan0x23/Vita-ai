import { Request, Response } from "express";
import {
  AppError,
  BadRequestError,
  InternalServerError,
} from "../../config/error";
import { db } from "../../db/db";
import { eq } from "drizzle-orm";
import { userSuperGoals } from "../../db/schema/user_supergoals";
import { updateSuperGoals } from "./dtos/update-super-goals.dto";

export const updateSuperGoalsHandler = async (
  req: Request,
  res: Response
): Promise<Response<{ ok: true }>> => {
  const input = updateSuperGoals.safeParse(req.body);

  if (!input.success) throw new BadRequestError(input.error.message);

  if (!req.user) {
    throw new BadRequestError("User ID is missing from request.");
  }
  try {
    await db.transaction(async (tx) => {
      const [superGoal] = await tx
        .selectDistinct()
        .from(userSuperGoals)
        .where(eq(userSuperGoals.userId, req.user!));

      await tx
        .update(userSuperGoals)
        .set({
          hydration: input.data.hydration ?? superGoal.hydration,
          movement: input.data.movement ?? superGoal.movement,
          sleep: input.data.sleep ?? superGoal.sleep,
          mood: input.data.mood ?? superGoal.mood,
          screen: input.data.screen ?? superGoal.screen,
        })
        .where(eq(userSuperGoals.userId, req.user!));
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new InternalServerError(
      "An unexpected error occurred while creating the user."
    );
  }
};
