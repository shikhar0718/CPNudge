import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ContestPlatform, ContestStatus } from "../../../generated/prisma/enums.js";
import {
  ContestReminderEligibilityService,
  DEFAULT_REMINDER_WINDOW_MINUTES,
} from "./contest-reminder-eligibility.service.js";
import type {
  ContestReminderContest,
  ContestReminderUser,
} from "./contest-reminder-eligibility.types.js";
import type { ContestReminderRepositoryDependencies } from "./contest-reminder-eligibility.service.js";

const now = new Date("2026-10-20T12:00:00.000Z");

const contest = (
  id: string,
  platform: ContestPlatform,
  startTime: string,
  status: ContestStatus = ContestStatus.UPCOMING
): ContestReminderContest => ({
  id,
  platform,
  title: `Contest ${id}`,
  url: `https://example.test/${id}`,
  startTime: new Date(startTime),
  endTime: new Date(new Date(startTime).getTime() + 60 * 60_000),
  status,
});

const user = (
  id: string,
  preference: ContestReminderUser["notificationPreference"],
  ...platforms: ContestPlatform[]
): ContestReminderUser => ({
  id,
  email: `${id}@example.test`,
  firstName: id,
  notificationPreference: preference,
  linkedPlatformAccounts: platforms.map((platform) => ({ platform })),
});

const serviceFor = (
  contests: ContestReminderContest[],
  users: ContestReminderUser[]
): ContestReminderEligibilityService => {
  const repository: ContestReminderRepositoryDependencies = {
    getUpcomingContestsForReminder: async () => contests,
    getUsersForContestReminders: async () => users,
  };
  return new ContestReminderEligibilityService(repository);
};

describe("contest reminder eligibility", () => {
  it("includes enabled users with a linked account when the contest is inside the reminder window", async () => {
    const contests = [contest("inside", ContestPlatform.CODEFORCES, "2026-10-20T12:59:00.000Z")];
    const users = [
      user(
        "enabled",
        {
          notificationsEnabled: true,
          enabledPlatforms: [ContestPlatform.CODEFORCES],
          reminderBeforeMinutes: 60,
        },
        ContestPlatform.CODEFORCES
      ),
    ];

    const result = await serviceFor(contests, users).evaluate(now);

    assert.equal(result.candidates.length, 1);
    assert.equal(result.candidates[0]?.userId, "enabled");
    assert.equal(result.candidates[0]?.contest.id, "inside");
    assert.equal(result.candidates[0]?.reminderAt.toISOString(), "2026-10-20T11:59:00.000Z");
  });

  it("excludes users with notifications disabled", async () => {
    const result = await serviceFor(
      [contest("disabled-contest", ContestPlatform.CODEFORCES, "2026-10-20T12:59:00.000Z")],
      [
        user(
          "disabled",
          {
            notificationsEnabled: false,
            enabledPlatforms: [ContestPlatform.CODEFORCES],
            reminderBeforeMinutes: 60,
          },
          ContestPlatform.CODEFORCES
        ),
      ]
    ).findEligibleCandidates(now);

    assert.deepEqual(result, []);
  });

  it("excludes contests whose platform is not enabled", async () => {
    const result = await serviceFor(
      [contest("wrong-platform", ContestPlatform.CODEFORCES, "2026-10-20T12:59:00.000Z")],
      [
        user(
          "leetcode-only",
          {
            notificationsEnabled: true,
            enabledPlatforms: [ContestPlatform.LEETCODE],
            reminderBeforeMinutes: 60,
          },
          ContestPlatform.CODEFORCES
        ),
      ]
    ).findEligibleCandidates(now);

    assert.deepEqual(result, []);
  });

  it("excludes users without a linked account for the contest platform", async () => {
    const result = await serviceFor(
      [contest("missing-account", ContestPlatform.CODEFORCES, "2026-10-20T12:59:00.000Z")],
      [
        user(
          "unlinked",
          {
            notificationsEnabled: true,
            enabledPlatforms: [ContestPlatform.CODEFORCES],
            reminderBeforeMinutes: 60,
          },
          ContestPlatform.LEETCODE
        ),
      ]
    ).findEligibleCandidates(now);

    assert.deepEqual(result, []);
  });

  it("excludes contests outside the five-minute reminder window and non-future contests", async () => {
    const result = await serviceFor(
      [
        contest("too-early", ContestPlatform.CODEFORCES, "2026-10-20T12:06:00.000Z"),
        contest("started", ContestPlatform.CODEFORCES, "2026-10-20T11:00:00.000Z"),
        contest(
          "ongoing-status",
          ContestPlatform.CODEFORCES,
          "2026-10-20T12:59:00.000Z",
          ContestStatus.ONGOING
        ),
      ],
      [
        user(
          "enabled",
          {
            notificationsEnabled: true,
            enabledPlatforms: [ContestPlatform.CODEFORCES],
            reminderBeforeMinutes: 60,
          },
          ContestPlatform.CODEFORCES
        ),
      ]
    ).findEligibleCandidates(now);

    assert.deepEqual(result, []);
    assert.equal(DEFAULT_REMINDER_WINDOW_MINUTES, 5);
  });

  it("returns one candidate for each eligible user and contest", async () => {
    const contests = [
      contest("codeforces", ContestPlatform.CODEFORCES, "2026-10-20T12:59:00.000Z"),
      contest("leetcode", ContestPlatform.LEETCODE, "2026-10-20T12:59:00.000Z"),
    ];
    const users = [
      user(
        "both",
        {
          notificationsEnabled: true,
          enabledPlatforms: [ContestPlatform.CODEFORCES, ContestPlatform.LEETCODE],
          reminderBeforeMinutes: 60,
        },
        ContestPlatform.CODEFORCES,
        ContestPlatform.LEETCODE
      ),
      user(
        "codeforces-user",
        {
          notificationsEnabled: true,
          enabledPlatforms: [ContestPlatform.CODEFORCES],
          reminderBeforeMinutes: 60,
        },
        ContestPlatform.CODEFORCES
      ),
    ];

    const result = await serviceFor(contests, users).findEligibleCandidates(now);

    assert.equal(result.length, 3);
    assert.deepEqual(
      result.map((candidate) => `${candidate.userId}:${candidate.contest.id}`),
      ["both:codeforces", "codeforces-user:codeforces", "both:leetcode"]
    );
  });
});
