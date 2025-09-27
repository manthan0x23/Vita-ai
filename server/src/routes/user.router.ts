import { Router } from "express";
import { asyncHandler } from "../middleware/handlers/async.handler";
import { loginUserHandler } from "../controllers/user/login-user.controller";
import { authenticateUserMiddleware } from "../middleware/auth.middleware";
import { getUserHandler } from "../controllers/user/get-user.controller";

const router = Router();

router
    .post("/login", asyncHandler(loginUserHandler))
    .get("/get", authenticateUserMiddleware, asyncHandler(getUserHandler));

export { router as userRouter };
