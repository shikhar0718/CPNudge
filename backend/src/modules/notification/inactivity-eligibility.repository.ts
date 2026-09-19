import { prisma } from "../../common/database/index.js";

export const getAccountsForInactivityEvaluation = async () => {
  return await prisma.linkedPlatformAccount.findMany({
    select: {
      userId: true,
      platform: true,
      lastSubmissionActivityDate: true,
      lastContestParticipationDate: true,
    },
  });
};
