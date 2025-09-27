import { Request, Response } from "express";
import {
  AppError,
  InternalServerError,
  NotFoundError,
} from "../../config/error";
import { resetUserTasks } from "../../engine/reset-tasks";
import { RecommendationEngine } from "../../engine/recommendation";

export const recommendTasksHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError("UserId not found");
  }
  try {
    await resetUserTasks(req.user);

    const tasks = await RecommendationEngine.recommend_tasks(
      req.user!,
      4,
      new Date()
    );

    return res.status(201).json({
      message: "Fetched tasks successfully",
      tasks,
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
