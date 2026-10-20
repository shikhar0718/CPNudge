import { ContestReminderNotificationService } from "../notification/contest-reminder-notification.service.js";

export class ContestReminderJob {
  constructor(
    private readonly contestReminderNotificationService = new ContestReminderNotificationService()
  ) {}

  async execute(): Promise<void> {
    await this.contestReminderNotificationService.execute();
  }

  async run(): Promise<void> {
    return this.execute();
  }
}
