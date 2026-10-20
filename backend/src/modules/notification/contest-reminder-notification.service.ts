import { logger } from "../../common/shared/logger.js";
import { sendContestReminderEmail } from "../email/email.service.js";
import {
  claimContestReminder,
  markContestReminderSent,
  releaseContestReminderClaim,
} from "./notification-history.repository.js";
import { contestReminderEligibilityService } from "./contest-reminder-eligibility.service.js";
import type { ContestReminderCandidate } from "./contest-reminder-eligibility.types.js";

export interface ContestReminderNotificationRepository {
  claimContestReminder: (
    identity: {
      userId: string;
      contestId: string;
      platform: ContestReminderCandidate["contest"]["platform"];
      reminderBeforeMinutes: number;
    },
    now?: Date
  ) => Promise<{ id: string } | null>;
  markContestReminderSent: (id: string, sentAt?: Date) => Promise<void>;
  releaseContestReminderClaim: (id: string) => Promise<void>;
}

export interface ContestReminderNotificationDependencies {
  eligibilityService: {
    findEligibleCandidates: (now: Date) => Promise<ContestReminderCandidate[]>;
  };
  repository: ContestReminderNotificationRepository;
  sendContestReminderEmail: typeof sendContestReminderEmail;
}

export interface ContestReminderProcessingResult {
  processedCandidates: number;
  eligibleCandidates: number;
  sent: number;
  skippedDuplicates: number;
  failed: number;
  skippedOverlap: boolean;
}

const defaultDependencies: ContestReminderNotificationDependencies = {
  eligibilityService: contestReminderEligibilityService,
  repository: {
    claimContestReminder,
    markContestReminderSent,
    releaseContestReminderClaim,
  },
  sendContestReminderEmail,
};

export class ContestReminderNotificationService {
  private isRunning = false;

  constructor(
    private readonly dependencies: ContestReminderNotificationDependencies = defaultDependencies
  ) {}

  async execute(now: Date = new Date()): Promise<ContestReminderProcessingResult> {
    if (this.isRunning) {
      logger.warn(
        "Contest reminder notification skipped because another execution is in progress."
      );
      return {
        processedCandidates: 0,
        eligibleCandidates: 0,
        sent: 0,
        skippedDuplicates: 0,
        failed: 0,
        skippedOverlap: true,
      };
    }

    this.isRunning = true;
    logger.info("Contest reminder notification job started.");

    const result: ContestReminderProcessingResult = {
      processedCandidates: 0,
      eligibleCandidates: 0,
      sent: 0,
      skippedDuplicates: 0,
      failed: 0,
      skippedOverlap: false,
    };

    try {
      const candidates = await this.dependencies.eligibilityService.findEligibleCandidates(now);
      result.eligibleCandidates = candidates.length;
      logger.info("Contest reminder notification candidates eligible.", {
        eligibleCandidates: candidates.length,
      });

      for (const candidate of candidates) {
        result.processedCandidates++;
        let claim: { id: string } | null = null;

        try {
          claim = await this.dependencies.repository.claimContestReminder(
            {
              userId: candidate.userId,
              contestId: candidate.contest.id,
              platform: candidate.contest.platform,
              reminderBeforeMinutes: Math.round(
                (new Date(candidate.contest.startTime).getTime() - candidate.reminderAt.getTime()) /
                  60_000
              ),
            },
            now
          );

          if (!claim) {
            result.skippedDuplicates++;
            continue;
          }

          await this.dependencies.sendContestReminderEmail(candidate.email, candidate.contest);
          await this.dependencies.repository.markContestReminderSent(claim.id, now);
          result.sent++;
          logger.info("Contest reminder email sent.", {
            userId: candidate.userId,
            contestId: candidate.contest.id,
          });
        } catch (error) {
          result.failed++;
          logger.error("Contest reminder email failed.", {
            err: error,
            userId: candidate.userId,
            contestId: candidate.contest.id,
          });

          if (claim) {
            try {
              await this.dependencies.repository.releaseContestReminderClaim(claim.id);
            } catch (releaseError) {
              logger.error("Failed to release contest reminder claim.", {
                err: releaseError,
                claimId: claim.id,
              });
            }
          }
        }
      }
    } catch (error) {
      result.failed++;
      logger.error("Contest reminder notification job failed.", { err: error });
    } finally {
      this.isRunning = false;
      logger.info("Contest reminder notification job completed.", result);
    }

    return result;
  }

  async run(now?: Date): Promise<ContestReminderProcessingResult> {
    return this.execute(now);
  }
}

export const contestReminderNotificationService = new ContestReminderNotificationService();

export const processContestReminders = async (
  now?: Date
): Promise<ContestReminderProcessingResult> => contestReminderNotificationService.execute(now);
