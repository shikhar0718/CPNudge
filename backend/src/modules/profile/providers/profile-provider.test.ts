import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import { CodeforcesProfileProvider } from "./codeforces.provider.js";
import { LeetcodeProfileProvider } from "./leetcode.provider.js";
import { CodechefProfileProvider } from "./codechef.provider.js";
import { AtcoderProfileProvider } from "./atcoder.provider.js";
import { ProfileProviderRegistry } from "./profile-provider.registry.js";

describe("Profile Providers Contest Participation", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("CodeforcesProfileProvider", () => {
    const provider = new CodeforcesProfileProvider();

    it("should support CODEFORCES platform", () => {
      assert.strictEqual(provider.supports(ContestPlatform.CODEFORCES), true);
      assert.strictEqual(provider.supports(ContestPlatform.LEETCODE), false);
    });

    it("should fetch and normalize contest participations successfully (Test Case 1)", async () => {
      const mockResponse = {
        status: "OK",
        result: [
          {
            contestId: 2050,
            contestName: "Codeforces Round 1050 (Div. 2)",
            handle: "tourist",
            rank: 1,
            ratingUpdateTimeSeconds: 1700000000,
            oldRating: 3800,
            newRating: 3850,
          },
          {
            contestId: 2049,
            contestName: "Codeforces Round 1049 (Div. 1)",
            handle: "tourist",
            rank: 3,
            ratingUpdateTimeSeconds: 1699000000,
            oldRating: 3750,
            newRating: 3800,
          },
        ],
      };

      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      const participations = await provider.fetchContestParticipation("tourist");

      assert.strictEqual(participations.length, 2);
      assert.deepStrictEqual(participations[0], {
        platform: ContestPlatform.CODEFORCES,
        contestId: "2050",
        contestName: "Codeforces Round 1050 (Div. 2)",
        participatedAt: new Date(1700000000 * 1000),
      });
      assert.deepStrictEqual(participations[1], {
        platform: ContestPlatform.CODEFORCES,
        contestId: "2049",
        contestName: "Codeforces Round 1049 (Div. 1)",
        participatedAt: new Date(1699000000 * 1000),
      });
    });

    it("should handle provider failure gracefully (Test Case 5)", async () => {
      globalThis.fetch = async () => {
        throw new Error("Network timeout");
      };

      const participations = await provider.fetchContestParticipation("invalid_user");
      assert.deepStrictEqual(participations, []);
    });

    it("should return empty array on API error status", async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ status: "FAILED", comment: "User not found" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });

      const participations = await provider.fetchContestParticipation("unknown_user");
      assert.deepStrictEqual(participations, []);
    });
  });

  describe("LeetcodeProfileProvider", () => {
    const provider = new LeetcodeProfileProvider();

    it("should support LEETCODE platform", () => {
      assert.strictEqual(provider.supports(ContestPlatform.LEETCODE), true);
      assert.strictEqual(provider.supports(ContestPlatform.CODECHEF), false);
    });

    it("should fetch and normalize contest participations successfully (Test Case 2)", async () => {
      const mockResponse = {
        data: {
          userContestRankingHistory: [
            {
              attended: true,
              rating: 1750,
              ranking: 540,
              contest: {
                title: "Weekly Contest 400",
                startTime: 1717295400,
                titleSlug: "weekly-contest-400",
              },
            },
            {
              attended: false,
              rating: 1750,
              ranking: 0,
              contest: {
                title: "Biweekly Contest 130",
                startTime: 1716647400,
                titleSlug: "biweekly-contest-130",
              },
            },
            {
              attended: true,
              rating: 1700,
              ranking: 890,
              contest: {
                title: "Weekly Contest 399",
                startTime: 1716087000,
                titleSlug: "",
              },
            },
          ],
        },
      };

      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      const participations = await provider.fetchContestParticipation("neal_wu");

      assert.strictEqual(participations.length, 2);
      assert.deepStrictEqual(participations[0], {
        platform: ContestPlatform.LEETCODE,
        contestId: "weekly-contest-400",
        contestName: "Weekly Contest 400",
        participatedAt: new Date(1717295400 * 1000),
      });
      assert.deepStrictEqual(participations[1], {
        platform: ContestPlatform.LEETCODE,
        contestId: "weekly-contest-399",
        contestName: "Weekly Contest 399",
        participatedAt: new Date(1716087000 * 1000),
      });
    });

    it("should handle provider failure gracefully (Test Case 5)", async () => {
      globalThis.fetch = async () => {
        throw new Error("GraphQL server unavailable");
      };

      const participations = await provider.fetchContestParticipation("invalid_user");
      assert.deepStrictEqual(participations, []);
    });

    it("should handle null userContestRankingHistory", async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ data: { userContestRankingHistory: null } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      const participations = await provider.fetchContestParticipation("new_user");
      assert.deepStrictEqual(participations, []);
    });
  });

  describe("CodechefProfileProvider", () => {
    const provider = new CodechefProfileProvider();

    it("should support CODECHEF platform", () => {
      assert.strictEqual(provider.supports(ContestPlatform.CODECHEF), true);
      assert.strictEqual(provider.supports(ContestPlatform.ATCODER), false);
    });

    it("should fetch and normalize contest participations successfully (Test Case 3)", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <body>
            <script>
              var all_rating = [
                {
                  "code": "START120A",
                  "name": "Starters 120 (Rated till 6 Stars)",
                  "end_date": "2024-02-14 22:30:00",
                  "rating": "1850",
                  "rank": "150"
                },
                {
                  "code": "COOK140",
                  "name": "Cook-Off 140",
                  "getyear": "2024",
                  "getmonth": "01",
                  "getday": "20",
                  "rating": "1800",
                  "rank": "200"
                }
              ];
            </script>
          </body>
        </html>
      `;

      globalThis.fetch = async () =>
        new Response(mockHtml, {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });

      const participations = await provider.fetchContestParticipation("chef_master");

      assert.strictEqual(participations.length, 2);
      assert.deepStrictEqual(participations[0], {
        platform: ContestPlatform.CODECHEF,
        contestId: "START120A",
        contestName: "Starters 120 (Rated till 6 Stars)",
        participatedAt: new Date("2024-02-14 22:30:00"),
      });
      assert.deepStrictEqual(participations[1], {
        platform: ContestPlatform.CODECHEF,
        contestId: "COOK140",
        contestName: "Cook-Off 140",
        participatedAt: new Date("2024-01-20"),
      });
    });

    it("should handle provider failure gracefully (Test Case 5)", async () => {
      globalThis.fetch = async () => {
        throw new Error("HTTP connection refused");
      };

      const participations = await provider.fetchContestParticipation("invalid_chef");
      assert.deepStrictEqual(participations, []);
    });

    it("should handle missing all_rating script in HTML", async () => {
      globalThis.fetch = async () =>
        new Response("<html><body><div>No data</div></body></html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });

      const participations = await provider.fetchContestParticipation("empty_profile");
      assert.deepStrictEqual(participations, []);
    });
  });

  describe("AtcoderProfileProvider", () => {
    const provider = new AtcoderProfileProvider();

    it("should support ATCODER platform", () => {
      assert.strictEqual(provider.supports(ContestPlatform.ATCODER), true);
      assert.strictEqual(provider.supports(ContestPlatform.CODEFORCES), false);
    });

    it("should fetch and normalize contest participations successfully (Test Case 4)", async () => {
      const mockHistory = [
        {
          IsRated: true,
          Place: 120,
          OldRating: 1800,
          NewRating: 1860,
          Performance: 2100,
          InnerPerformance: 2100,
          ContestScreenName: "abc350.contest.atcoder.jp",
          ContestName: "Toyota Programming Contest 2024#4 (AtCoder Beginner Contest 350)",
          ContestNameEn: "AtCoder Beginner Contest 350",
          EndTime: "2024-04-20T22:40:00+09:00",
        },
        {
          IsRated: true,
          Place: 450,
          OldRating: 1750,
          NewRating: 1800,
          Performance: 1900,
          InnerPerformance: 1900,
          ContestScreenName: "arc175",
          ContestName: "AtCoder Regular Contest 175",
          EndTime: "2024-03-24T23:00:00+09:00",
        },
      ];

      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockHistory), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      const participations = await provider.fetchContestParticipation("chokudai");

      assert.strictEqual(participations.length, 2);
      assert.deepStrictEqual(participations[0], {
        platform: ContestPlatform.ATCODER,
        contestId: "abc350",
        contestName: "Toyota Programming Contest 2024#4 (AtCoder Beginner Contest 350)",
        participatedAt: new Date("2024-04-20T22:40:00+09:00"),
      });
      assert.deepStrictEqual(participations[1], {
        platform: ContestPlatform.ATCODER,
        contestId: "arc175",
        contestName: "AtCoder Regular Contest 175",
        participatedAt: new Date("2024-03-24T23:00:00+09:00"),
      });
    });

    it("should handle provider failure gracefully (Test Case 5)", async () => {
      globalThis.fetch = async () => {
        throw new Error("AtCoder history endpoint 503");
      };

      const participations = await provider.fetchContestParticipation("invalid_user");
      assert.deepStrictEqual(participations, []);
    });

    it("should handle non-array response gracefully", async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });

      const participations = await provider.fetchContestParticipation("rate_limited_user");
      assert.deepStrictEqual(participations, []);
    });
  });

  describe("ProfileProviderRegistry", () => {
    it("should register all 4 providers and support all platforms", () => {
      const registry = new ProfileProviderRegistry();
      assert.strictEqual(registry.getAll().length, 4);

      assert.strictEqual(registry.supports(ContestPlatform.CODEFORCES), true);
      assert.strictEqual(registry.supports(ContestPlatform.LEETCODE), true);
      assert.strictEqual(registry.supports(ContestPlatform.CODECHEF), true);
      assert.strictEqual(registry.supports(ContestPlatform.ATCODER), true);

      const cf = registry.get(ContestPlatform.CODEFORCES);
      const lc = registry.get(ContestPlatform.LEETCODE);
      const cc = registry.get(ContestPlatform.CODECHEF);
      const ac = registry.get(ContestPlatform.ATCODER);

      assert.ok(cf);
      assert.ok(lc);
      assert.ok(cc);
      assert.ok(ac);
    });
  });
});
