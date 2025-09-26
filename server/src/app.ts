import express from "express";
import { Env } from "./config/env";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { ApiRouter } from "./routes";
import errorHandler from "./middleware/handlers/error.handler";

const app = express();

app
  .use(cors({ origin: "*", credentials: true }))
  .use(helmet())
  .use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
  .use(express.json())
  .use(cookieParser())
  .use("/api", ApiRouter)
  .use(errorHandler);

const server = app.listen(Env.PORT, () => {
  console.log(`Server running on PORT ${Env.PORT}`);
});

const shutdown = async (signal: string) => {
  console.info(`\nReceived ${signal}, shutting down gracefully...`);

  try {
    server.close(() => {
      console.info("HTTP server closed.");
    });

    setTimeout(() => {
      console.warn("Force exiting process.");
      process.exit(1);
    }, 10000).unref();
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
