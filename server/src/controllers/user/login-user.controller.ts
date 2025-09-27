import { Request, Response } from "express";
import { loginUserInput } from "./dtos/create-user.dto";
import {
  AppError,
  BadRequestError,
  InternalServerError,
} from "../../config/error";
import { db } from "../../db/db";
import {
  systemState,
  tasks,
  userGoals,
  users,
  userTasks,
} from "../../db/schema";
import { eq } from "drizzle-orm";
import { categoryUnits } from "../../utils/dtos/enums";
import { Env } from "../../config/env";

type HandlerResponse = {
  message: string;
  data: {
    userId: number;
  };
};

export const loginUserHandler = async (
  req: Request,
  res: Response
): Promise<Response<HandlerResponse>> => {
  const input = loginUserInput.safeParse(req.body);
  if (!input.success) {
    throw new BadRequestError(input.error.message);
  }

  try {
    let [user] = await db
      .selectDistinct()
      .from(users)
      .where(eq(users.email, input.data.email));

    if (!user) {
      user = await db.transaction(async (tx) => {
        const [user1] = await tx
          .insert(users)
          .values({
            ...input.data,
          })
          .returning();

        await tx.insert(systemState).values({
          id: user1.id,
          lastRefresh: new Date(),
        });

        await Promise.all(
          categoryUnits.map(async (cat) => {
            await tx.insert(userGoals).values({
              userId: user1.id,
              goalType: cat.category,
              currentValue: 0,
              unit: cat.unit,
            });
          })
        );

        const general_tasks = await tx.select({ taskId: tasks.id }).from(tasks);

        await Promise.all(
          general_tasks.map(async ({ taskId }) => {
            await tx.insert(userTasks).values({
              taskId: taskId,
              userId: user1.id,
              ignores: 0,
              status: "pending",
            });
          })
        );

        return user1;
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: Env.NODE_ENV === "production",
      sameSite: "lax" as "lax" | "strict" | "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("token", user.id, cookieOptions);

    return res.status(201).json({
      message: "User created successfully",
      data: { userId: user.id },
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
