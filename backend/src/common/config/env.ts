import dotenv from "dotenv";

dotenv.config();

if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL environment variable is required in production");
}

export const env = {
  LOG_LEVEL: process.env.LOG_LEVEL ?? "silly",
  CONTEST_SYNC_CRON: process.env.CONTEST_SYNC_CRON ?? "*/1 * * * *",
  SUBMISSION_SYNC_CRON: process.env.SUBMISSION_SYNC_CRON ?? "0 */6 * * *",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PASSWORD_RESET_TOKEN_EXPIRES_IN: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN ?? "1h",
};
