import type { ContestPlatform } from "../../../generated/prisma/enums.js";
import { getAccountsForInactivityEvaluation } from "./inactivity-eligibility.repository.js";
export type InactivityType =
  | "SUBMISSION_3_DAYS"
  | "SUBMISSION_7_DAYS"
  | "SUBMISSION_30_DAYS"
  | "CONTEST_14_DAYS"
  | "CONTEST_30_DAYS";

export interface InactivityCandidate {
  userId: string;
  platform: ContestPlatform;
  inactivityType: InactivityType;
  lastActivity: Date;
  inactiveDays: number;
}

export interface InactivityEvaluationSummary {
  processedAccounts: number;
  submissionCandidates: number;
  contestCandidates: number;
  totalCandidates: number;
}

export interface InactivityEvaluationResult {
  candidates: InactivityCandidate[];
  summary: InactivityEvaluationSummary;
}

export type InactivityEvaluationAccount = Awaited<
  ReturnType<typeof getAccountsForInactivityEvaluation>
>[number];
