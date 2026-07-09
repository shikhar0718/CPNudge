import "./common/config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRouter from "./modules/health/health.route.js";
import { authRouter } from "./modules/auth/index.js";
import { notFoundMiddleware, errorHandlerMiddleware } from "./common/middleware/index.js";

const app = express();

// checking the security
app.use(helmet());

// checking the CORS
app.use(cors());

// body parser
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// logger
app.use(morgan("dev"));

// routes
app.use("/health", healthRouter);
app.use("/api/v1/auth", authRouter);

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Backend is running");
});

// error handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
