import { Router } from "express";

const router: Router = Router();

router.get("/health", (_, res) => {
  return res.json({
    success: "Health check working good",
  });
});

export { router as ApiRouter };
