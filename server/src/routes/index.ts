import { Router } from "express";
import { userRouter } from "./user.router";
import { taskRouter } from "./task.router";

const router: Router = Router();

router.use("/user", userRouter);
router.use("/task", taskRouter);

router.get("/health", (_, res) => {
  return res.json({
    success: "Health check working good",
  });
});

export { router as ApiRouter };
