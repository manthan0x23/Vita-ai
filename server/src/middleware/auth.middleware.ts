import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../config/error";

export const authenticateUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  try {
    req.user = token;
    next();
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token");
  }
};
