import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { AppError } from "../../config/error";

const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error("Unexpected Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
};

export default errorHandler;
