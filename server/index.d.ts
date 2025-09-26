import { Express } from "express";

declare global {
  namespace Express {
    interface Request {
      user: string;
      files?: Record<string, any>;
    }
  }
}
