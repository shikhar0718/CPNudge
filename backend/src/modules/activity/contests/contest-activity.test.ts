import { describe, it } from "node:test";
import assert from "node:assert";
import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import { ContestActivitySyncService } from "./contest-activity-sync.service.js";
import { ContestActivityService } from "./contest-activity.service.js";
import type {
  ProfileProvider,
  NormalizedContestParticipation,
} from "../../profile/providers/profile-provider.interface.js";
import type {
  LinkedAccountForSync,
  UpsertContestActivityParams,
} from "./contest-activity.types.js";

describe("ContestActivity Module Tests", () => {
  const createMockRepo = () => {
    const upserted: { userId: string; participations: UpsertContestActivityParams[] }[] = [];
    const updatedMetadata: { userId: string; platform: ContestPlatform; lastContestAt: Date }[] =
      [];
    let accounts: LinkedAccountForSync[] = [];

    return {
      upserted,
      updatedMetadata,
      setAccounts: (accs: LinkedAccountForSync[]) => {
        accounts = accs;
      },
      repo: {
        getLinkedAccountsForContestSync: async (_userId?: string) => accounts,
        upsertManyParticipations: async (
          userId: string,
          participations: UpsertContestActivityParams[]
        ) => {
          upserted.push({ userId, participations });
        },
        updateLastContestAt: async (
          userId: string,
          platform: ContestPlatform,
          lastContestAt: Date
        ) => {
          updatedMetadata.push({ userId, platform, lastContestAt });
        },
      },
    };
  };

  const createMockRegistry = (providerMap: Partial<Record<ContestPlatform, ProfileProvider>>) => {
    return {
      get: (platform: ContestPlatform) => providerMap[platform],
    };
  };

  describe("ContestActivitySyncService", () => {
    it("Test Case 1: Codeforces account - contest history persisted and lastContestAt updated", async () => {
      const mockRepo = createMockRepo();
      const cfParticipations: NormalizedContestParticipation[] = [
        {
          platform: ContestPlatform.CODEFORCES,
          contestId: "1900",
          contestName: "Codeforces Round 900",
          participatedAt: new Date("2026-08-10T14:35:00Z"),
        },
        {
          platform: ContestPlatform.CODEFORCES,
          contestId: "1901",
          contestName: "Codeforces Round 901",
          participatedAt: new Date("2026-08-25T14:35:00Z"),
        },
      ];

      const cfProvider: ProfileProvider = {
        supports: (p) => p === ContestPlatform.CODEFORCES,
        verify: async () => true,
        fetchContestParticipation: async () => cfParticipations,
      };

      mockRepo.setAccounts([
        {
          id: "cf-1",
          userId: "user-1",
          platform: ContestPlatform.CODEFORCES,
          username: "tourist",
        },
      ]);

      const service = new ContestActivitySyncService(
        mockRepo.repo,
        createMockRegistry({ [ContestPlatform.CODEFORCES]: cfProvider })
      );

      const summary = await service.syncContestParticipation();

      assert.strictEqual(summary.processedAccounts, 1);
      assert.strictEqual(summary.successfulAccounts, 1);
      assert.strictEqual(summary.failedAccounts, 0);
      assert.strictEqual(summary.totalParticipationsStored, 2);

      assert.strictEqual(mockRepo.upserted.length, 1);
      assert.strictEqual(mockRepo.upserted[0]!.userId, "user-1");
      assert.strictEqual(mockRepo.upserted[0]!.participations.length, 2);

      assert.strictEqual(mockRepo.updatedMetadata.length, 1);
      assert.strictEqual(mockRepo.updatedMetadata[0]!.userId, "user-1");
      assert.strictEqual(mockRepo.updatedMetadata[0]!.platform, ContestPlatform.CODEFORCES);
      assert.strictEqual(
        mockRepo.updatedMetadata[0]!.lastContestAt.toISOString(),
        new Date("2026-08-25T14:35:00Z").toISOString()
      );
    });

    it("Test Case 2: LeetCode account - contest history persisted and lastContestAt updated", async () => {
      const mockRepo = createMockRepo();
      const lcParticipations: NormalizedContestParticipation[] = [
        {
          platform: ContestPlatform.LEETCODE,
          contestId: "weekly-contest-400",
          contestName: "Weekly Contest 400",
          participatedAt: new Date("2026-06-02T02:30:00Z"),
        },
      ];

      const lcProvider: ProfileProvider = {
        supports: (p) => p === ContestPlatform.LEETCODE,
        verify: async () => true,
        fetchContestParticipation: async () => lcParticipations,
      };

      mockRepo.setAccounts([
        {
          id: "lc-1",
          userId: "user-2",
          platform: ContestPlatform.LEETCODE,
          username: "leetcode_coder",
        },
      ]);

      const service = new ContestActivitySyncService(
        mockRepo.repo,
        createMockRegistry({ [ContestPlatform.LEETCODE]: lcProvider })
      );

      const summary = await service.syncContestParticipation();

      assert.strictEqual(summary.processedAccounts, 1);
      assert.strictEqual(summary.successfulAccounts, 1);
      assert.strictEqual(summary.failedAccounts, 0);
      assert.strictEqual(summary.totalParticipationsStored, 1);
      assert.strictEqual(mockRepo.upserted.length, 1);
      assert.strictEqual(mockRepo.updatedMetadata[0]!.platform, ContestPlatform.LEETCODE);
    });

    it("Test Case 5: Provider returns empty history - no error, no metadata overwrite", async () => {
      const mockRepo = createMockRepo();
      const emptyProvider: ProfileProvider = {
        supports: (p) => p === ContestPlatform.CODEFORCES,
        verify: async () => true,
        fetchContestParticipation: async () => [],
      };

      mockRepo.setAccounts([
        {
          id: "cf-empty",
          userId: "user-empty",
          platform: ContestPlatform.CODEFORCES,
          username: "empty_coder",
          lastContestParticipationDate: new Date("2026-01-01T00:00:00Z"),
        },
      ]);

      const service = new ContestActivitySyncService(
        mockRepo.repo,
        createMockRegistry({ [ContestPlatform.CODEFORCES]: emptyProvider })
      );

      const summary = await service.syncContestParticipation();

      assert.strictEqual(summary.processedAccounts, 1);
      assert.strictEqual(summary.successfulAccounts, 1);
      assert.strictEqual(summary.failedAccounts, 0);
      assert.strictEqual(summary.totalParticipationsStored, 0);
      assert.strictEqual(mockRepo.upserted.length, 0);
      assert.strictEqual(mockRepo.updatedMetadata.length, 0);
    });

    it("Test Case 6: One provider fails - failure logged, other providers continue", async () => {
      const mockRepo = createMockRepo();

      const cfProvider: ProfileProvider = {
        supports: (p) => p === ContestPlatform.CODEFORCES,
        verify: async () => true,
        fetchContestParticipation: async () => [
          {
            platform: ContestPlatform.CODEFORCES,
            contestId: "1900",
            contestName: "Codeforces Round 900",
            participatedAt: new Date("2026-08-10T14:35:00Z"),
          },
        ],
      };

      const failingCcProvider: ProfileProvider = {
        supports: (p) => p === ContestPlatform.CODECHEF,
        verify: async () => true,
        fetchContestParticipation: async () => {
          throw new Error("CodeChef API timeout");
        },
      };

      mockRepo.setAccounts([
        {
          id: "cf-1",
          userId: "user-cf",
          platform: ContestPlatform.CODEFORCES,
          username: "cf_user",
        },
        {
          id: "cc-1",
          userId: "user-cc",
          platform: ContestPlatform.CODECHEF,
          username: "cc_user",
        },
      ]);

      const service = new ContestActivitySyncService(
        mockRepo.repo,
        createMockRegistry({
          [ContestPlatform.CODEFORCES]: cfProvider,
          [ContestPlatform.CODECHEF]: failingCcProvider,
        })
      );

      const summary = await service.syncContestParticipation();

      assert.strictEqual(summary.processedAccounts, 2);
      assert.strictEqual(summary.successfulAccounts, 1);
      assert.strictEqual(summary.failedAccounts, 1);
      assert.strictEqual(summary.totalParticipationsStored, 1);
    });
  });

  describe("ContestActivityService", () => {
    it("should coordinate user contest activity and sync methods", async () => {
      const mockSyncService = {
        syncUserContestActivity: async (userId: string) => ({
          processedAccounts: 1,
          successfulAccounts: 1,
          failedAccounts: 0,
          totalParticipationsStored: 5,
        }),
        syncAllContestActivity: async () => ({
          processedAccounts: 10,
          successfulAccounts: 10,
          failedAccounts: 0,
          totalParticipationsStored: 50,
        }),
      } as unknown as ContestActivitySyncService;

      const service = new ContestActivityService(mockSyncService);

      const userSync = await service.syncUserContestActivity("user-123");
      assert.strictEqual(userSync.totalParticipationsStored, 5);

      const allSync = await service.syncAllContestActivity();
      assert.strictEqual(allSync.totalParticipationsStored, 50);
    });
  });
});
