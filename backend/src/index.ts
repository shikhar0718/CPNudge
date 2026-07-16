import app from "./app.js";
import { SchedulerService } from "./modules/scheduler/scheduler.service.js";
import { logger } from "./common/shared/logger.js";

const PORT = process.env.PORT;
app.listen(PORT, () => {
  logger.info(`The server is running on: http://localhost:${PORT}`);

  // starting the background jobs(ContestSync() for now )
  const schedulerService = new SchedulerService();
  schedulerService.start();
});
