import { logger } from "../../common/shared/logger.js";
import { getAccountsForInactivityEvaluation } from "./inactivity-eligibility.repository.js";
import type {
  InactivityCandidate,
  InactivityEvaluationAccount,
  InactivityEvaluationResult,
  InactivityEvaluationSummary,
  InactivityType,
} from "./inactivity-eligibility.types.js";

const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

export const calculateInactiveDays = (lastActivityDate: Date, now: Date = new Date()): number => {
  const diffMs = now.getTime() - lastActivityDate.getTime();
  if (diffMs <= 0) {
    return 0;
  }
  return Math.floor(diffMs / MILLISECONDS_IN_A_DAY);
};

export const evaluateSubmissionInactivity = (
  account: InactivityEvaluationAccount,
  now: Date = new Date()
): InactivityCandidate | null => {
  if (!account.lastSubmissionActivityDate) {
    return null;
  }

  const inactiveDays = calculateInactiveDays(account.lastSubmissionActivityDate, now);

  let inactivityType: InactivityType | null = null;
  if (inactiveDays >= 30) {
    inactivityType = "SUBMISSION_30_DAYS";
  } else if (inactiveDays >= 7) {
    inactivityType = "SUBMISSION_7_DAYS";
  } else if (inactiveDays >= 3) {
    inactivityType = "SUBMISSION_3_DAYS";
  }

  if (!inactivityType) {
    return null;
  }

  return {
    userId: account.userId,
    platform: account.platform,
    inactivityType,
    lastActivity: account.lastSubmissionActivityDate,
    inactiveDays,
  };
};

export const evaluateContestInactivity = (
  account: InactivityEvaluationAccount,
  now: Date = new Date()
): InactivityCandidate | null => {
  if (!account.lastContestParticipationDate) {
    return null;
  }

  const inactiveDays = calculateInactiveDays(account.lastContestParticipationDate, now);

  let inactivityType: InactivityType | null = null;
  if (inactiveDays >= 30) {
    inactivityType = "CONTEST_30_DAYS";
  } else if (inactiveDays >= 14) {
    inactivityType = "CONTEST_14_DAYS";
  }

  if (!inactivityType) {
    return null;
  }

  return {
    userId: account.userId,
    platform: account.platform,
    inactivityType,
    lastActivity: account.lastContestParticipationDate,
    inactiveDays,
  };
};

export class InactivityEligibilityService {
  constructor(
    private readonly repository: {
      getAccountsForInactivityEvaluation: () => Promise<InactivityEvaluationAccount[]>;
    } = { getAccountsForInactivityEvaluation }
  ) {}

  async evaluateInactivityEligibility(
    accounts?: InactivityEvaluationAccount[],
    now: Date = new Date()
  ): Promise<InactivityEvaluationResult> {
    logger.info("Starting inactivity eligibility evaluation...");

    const targetAccounts = accounts ?? (await this.repository.getAccountsForInactivityEvaluation());

    const candidates: InactivityCandidate[] = [];
    let submissionCandidatesCount = 0;
    let contestCandidatesCount = 0;

    for (const account of targetAccounts) {
      const submissionCandidate = evaluateSubmissionInactivity(account, now);
      if (submissionCandidate) {
        logger.info(
          `Generated ${submissionCandidate.inactivityType} candidate for user ${account.userId}`
        );
        candidates.push(submissionCandidate);
        submissionCandidatesCount++;
      }

      const contestCandidate = evaluateContestInactivity(account, now);
      if (contestCandidate) {
        logger.info(`Generated ${contestCandidate.inactivityType} candidate`, {
          userId: account.userId,
          platform: account.platform,
        });
        candidates.push(contestCandidate);
        contestCandidatesCount++;
      }
    }

    const summary: InactivityEvaluationSummary = {
      processedAccounts: targetAccounts.length,
      submissionCandidates: submissionCandidatesCount,
      contestCandidates: contestCandidatesCount,
      totalCandidates: candidates.length,
    };

    logger.info("Inactivity evaluation completed.", {
      processedAccounts: summary.processedAccounts,
      submissionCandidates: summary.submissionCandidates,
      contestCandidates: summary.contestCandidates,
      totalCandidates: summary.totalCandidates,
    });

    return {
      candidates,
      summary,
    };
  }
}

export const inactivityEligibilityService = new InactivityEligibilityService();

export const evaluateInactivityEligibility = async (
  accounts?: InactivityEvaluationAccount[],
  now: Date = new Date()
): Promise<InactivityEvaluationResult> => {
  return inactivityEligibilityService.evaluateInactivityEligibility(accounts, now);
};
