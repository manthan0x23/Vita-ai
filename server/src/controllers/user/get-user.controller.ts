import { Request, Response } from "express";
import {
  AppError,
  BadRequestError,
  InternalServerError,
} from "../../config/error";
import { db } from "../../db/db";
import { userGoals, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { userSuperGoals } from "../../db/schema/user_supergoals";

export const getUserHandler = async (
  req: Request,
  res: Response
): Promise<Response<any>> => {
  try {
    if (!req.user) {
      throw new BadRequestError("User ID is missing from request.");
    }

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .selectDistinct()
        .from(users)
        .where(eq(users.id, req.user!))
        .limit(1);

      const [userSuperGoal] = await tx
        .selectDistinct()
        .from(userSuperGoals)
        .where(eq(userSuperGoals.userId, req.user!));

      const goals = (
        await tx.select().from(userGoals).where(eq(userGoals.userId, user.id))
      ).map((g) => ({
        type: g.goalType,
        progress: g.currentValue + " " + g.unit,
        target: userSuperGoal[g.goalType],
      }));
      return { ...user, goals };
    });

    return res.status(201).json({
      message: "User fetched successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new InternalServerError(
      "An unexpected error occurred while creating the user."
    );
  }
};
