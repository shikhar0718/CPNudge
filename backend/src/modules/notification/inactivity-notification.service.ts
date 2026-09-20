import {
  createNotificationHistory,
  findLatestNotificationByType,
} from "./notification-history.repository.js";
import { logger } from "../../common/shared/logger.js";
import type { InactivityCandidate } from "./inactivity-eligibility.types.js";
import type {
  NotificationDeliveryRequest,
  NotificationProcessingResult,
} from "./notification.types.js";

export class InactivityNotificationService {
  constructor(
    private readonly repository: {
      findLatestNotificationByType: typeof findLatestNotificationByType;
      createNotificationHistory: typeof createNotificationHistory;
    } = {
      findLatestNotificationByType,
      createNotificationHistory,
    }
  ) {}

  async isEligibleForNotification(candidate: InactivityCandidate): Promise<boolean> {
    try {
      const latestNotification = await this.repository.findLatestNotificationByType(
        candidate.userId,
        candidate.platform,
        candidate.inactivityType
      );

      if (latestNotification === null) {
        return true;
      }

      // If user had new activity after the last notification of this type was sent,
      // they are eligible for a new notification cycle.
      // If no new activity occurred since the notification, skip to prevent duplicate spam.
      return (
        new Date(candidate.lastActivity).getTime() > new Date(latestNotification.sentAt).getTime()
      );
    } catch (error) {
      logger.error("Failed to check notification eligibility for candidate", {
        err: error,
        userId: candidate.userId,
        platform: candidate.platform,
        inactivityType: candidate.inactivityType,
      });
      throw error;
    }
  }

  async processCandidates(
    candidates: InactivityCandidate[]
  ): Promise<NotificationProcessingResult> {
    logger.info(
      `Starting inactivity notification processing for ${candidates.length} candidates...`
    );

    const requests: NotificationDeliveryRequest[] = [];
    let processedCandidates = 0;
    let generatedRequests = 0;
    let skippedSameCycle = 0;

    for (const candidate of candidates) {
      processedCandidates++;

      try {
        const eligible = await this.isEligibleForNotification(candidate);
        if (!eligible) {
          skippedSameCycle++;
          continue;
        }

        await this.repository.createNotificationHistory(
          candidate.userId,
          candidate.platform,
          candidate.inactivityType
        );

        const request: NotificationDeliveryRequest = {
          userId: candidate.userId,
          platform: candidate.platform,
          notificationType: candidate.inactivityType,
          lastActivityAt: candidate.lastActivity,
          inactiveDays: candidate.inactiveDays,
        };

        requests.push(request);
        generatedRequests++;
      } catch (error) {
        logger.error("Failed to process inactivity candidate notification", {
          err: error,
          userId: candidate.userId,
          platform: candidate.platform,
          inactivityType: candidate.inactivityType,
        });
      }
    }

    logger.info("Inactivity notification processing completed.", {
      processedCandidates,
      generatedRequests,
      skippedSameCycle,
    });

    return {
      requests,
      processedCandidates,
      generatedRequests,
      skippedSameCycle,
    };
  }
}

export const inactivityNotificationService = new InactivityNotificationService();

export const processInactivityCandidates = async (
  candidates: InactivityCandidate[]
): Promise<NotificationProcessingResult> => {
  return inactivityNotificationService.processCandidates(candidates);
};
