import { Router } from "express";
import { asyncHandler } from "../middleware/handlers/async.handler";
import { loginUserHandler } from "../controllers/user/login-user.controller";
import { authenticateUserMiddleware } from "../middleware/auth.middleware";
import { getUserHandler } from "../controllers/user/get-user.controller";
import { userMetricsHandler } from "../controllers/user/user-metrics.controller";
import { updateSuperGoalsHandler } from "../controllers/user/update-super-goals.controller";

const router = Router();

router
  .post("/login", asyncHandler(loginUserHandler))
  .put(
    "/super-goals",
    authenticateUserMiddleware,
    asyncHandler(updateSuperGoalsHandler)
  )
  .get("/get", authenticateUserMiddleware, asyncHandler(getUserHandler))
  .get(
    "/metrics",
    authenticateUserMiddleware,
    asyncHandler(userMetricsHandler)
  );

export { router as userRouter };
