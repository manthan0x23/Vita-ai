import { Request, Response } from "express";
import { AppError, InternalServerError } from "../../config/error";
import { seed_global_tasks } from "../../db/seed/tasks";

export const seedTasksHandler = async (_req: Request, res: Response) => {
  try {
    await seed_global_tasks();

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
