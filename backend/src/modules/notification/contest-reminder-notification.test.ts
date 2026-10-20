import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ContestPlatform } from "../../../generated/prisma/enums.js";
import { ContestReminderNotificationService } from "./contest-reminder-notification.service.js";
import type { ContestReminderCandidate } from "./contest-reminder-eligibility.types.js";

const now = new Date("2026-10-20T12:00:00.000Z");

const candidate = (userId: string, contestId: string): ContestReminderCandidate => ({
  userId,
  email: `${userId}@example.test`,
  firstName: userId,
  contest: {
    id: contestId,
    title: `${contestId} contest`,
    url: `https://example.test/${contestId}`,
    platform: ContestPlatform.CODEFORCES,
    startTime: new Date("2026-10-20T13:00:00.000Z"),
    endTime: new Date("2026-10-20T15:00:00.000Z"),
  },
  reminderAt: new Date("2026-10-20T12:00:00.000Z"),
});

const serviceFor = (
  candidates: ContestReminderCandidate[],
  options: {
    claim?: (identity: { userId: string; contestId: string }) => Promise<{ id: string } | null>;
    send?: (to: string) => Promise<void>;
  } = {}
) => {
  const claims: { userId: string; contestId: string }[] = [];
  const released: string[] = [];
  const sent: string[] = [];
  const service = new ContestReminderNotificationService({
    eligibilityService: { findEligibleCandidates: async () => candidates },
    repository: {
      claimContestReminder: async (identity) => {
        claims.push(identity);
        return options.claim
          ? options.claim({ userId: identity.userId, contestId: identity.contestId })
          : { id: `${identity.userId}:${identity.contestId}` };
      },
      markContestReminderSent: async (id) => {
        sent.push(id);
      },
      releaseContestReminderClaim: async (id) => {
        released.push(id);
      },
    },
    sendContestReminderEmail: async (to) => {
      if (options.send) return options.send(to);
    },
  });

  return { service, claims, released, sent };
};

describe("contest reminder notification delivery", () => {
  it("sends an eligible reminder once and marks it sent", async () => {
    const harness = serviceFor([candidate("user-1", "contest-1")]);

    const result = await harness.service.execute(now);

    assert.equal(result.sent, 1);
    assert.equal(result.failed, 0);
    assert.deepEqual(harness.sent, ["user-1:contest-1"]);
    assert.deepEqual(harness.released, []);
  });

  it("skips a duplicate claim without sending another email", async () => {
    let sendCount = 0;
    const harness = serviceFor([candidate("user-1", "contest-1")], {
      claim: async () => null,
      send: async () => {
        sendCount++;
      },
    });

    const result = await harness.service.execute(now);

    assert.equal(result.skippedDuplicates, 1);
    assert.equal(result.sent, 0);
    assert.equal(sendCount, 0);
  });

  it("releases a claim when sending fails so the failed send is not recorded", async () => {
    const harness = serviceFor([candidate("user-1", "contest-1")], {
      send: async () => {
        throw new Error("SMTP unavailable");
      },
    });

    const result = await harness.service.execute(now);

    assert.equal(result.failed, 1);
    assert.deepEqual(harness.sent, []);
    assert.deepEqual(harness.released, ["user-1:contest-1"]);
  });

  it("processes multiple users and contests independently", async () => {
    const harness = serviceFor([
      candidate("user-1", "contest-1"),
      candidate("user-2", "contest-1"),
      candidate("user-1", "contest-2"),
    ]);

    const result = await harness.service.execute(now);

    assert.equal(result.sent, 3);
    assert.equal(result.processedCandidates, 3);
    assert.equal(harness.claims.length, 3);
  });

  it("guards against overlapping process-local executions", async () => {
    let resolveEligibility!: () => void;
    const eligibilityStarted = new Promise<void>((resolve) => {
      resolveEligibility = resolve;
    });
    const service = new ContestReminderNotificationService({
      eligibilityService: {
        findEligibleCandidates: async () => {
          await eligibilityStarted;
          return [];
        },
      },
      repository: {
        claimContestReminder: async () => null,
        markContestReminderSent: async () => undefined,
        releaseContestReminderClaim: async () => undefined,
      },
      sendContestReminderEmail: async () => undefined,
    });

    const first = service.execute(now);
    const overlapping = await service.execute(now);
    assert.equal(overlapping.skippedOverlap, true);

    resolveEligibility();
    const firstResult = await first;
    assert.equal(firstResult.skippedOverlap, false);
  });
});
