import { Router } from "express";
import { authenticateUserMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/handlers/async.handler";
import { recommendTasksHandler } from "../controllers/tasks/recommend-tasks.controller";
import { updateTaskStatusHandler } from "../controllers/tasks/update-task-status.controller";

const router: Router = Router();

router
  .get(
    "/recommend",
    authenticateUserMiddleware,
    asyncHandler(recommendTasksHandler)
  )
  .put(
    "/update-status",
    authenticateUserMiddleware,
    asyncHandler(updateTaskStatusHandler)
  );

export { router as taskRouter };
