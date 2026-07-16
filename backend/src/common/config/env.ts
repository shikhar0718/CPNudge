import dotenv from "dotenv";

dotenv.config();

export const env = {
  LOG_LEVEL: process.env.LOG_LEVEL ?? "silly",
  CONTEST_SYNC_CRON: process.env.CONTEST_SYNC_CRON ?? "*/1 * * * *",
};
