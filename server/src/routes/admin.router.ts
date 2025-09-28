import { Router } from "express";
import { asyncHandler } from "../middleware/handlers/async.handler";
import { seedTasksHandler } from "../controllers/admin/seed-tasks.controller";

const router: Router = Router();

router.get("/seed", asyncHandler(seedTasksHandler));

export { router as adminRouter };
