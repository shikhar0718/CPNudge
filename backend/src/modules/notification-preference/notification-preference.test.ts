import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ContestPlatform } from "../../../generated/prisma/enums.js";
import { updateNotificationPreferenceSchema } from "./notification-preference.dto.js";
import {
  DEFAULT_NOTIFICATION_PREFERENCE,
  getNotificationPreference,
  updateNotificationPreference,
} from "./notification-preference.service.js";

describe("notification preferences", () => {
  it("returns defaults when a user has no saved preference", async () => {
    const result = await getNotificationPreference("user-1", {
      findNotificationPreference: async () => null,
      upsertNotificationPreference: async () => {
        throw new Error("not expected");
      },
    });

    assert.deepEqual(result, DEFAULT_NOTIFICATION_PREFERENCE);
  });

  it("merges and persists an update through the injected repository", async () => {
    let saved: Record<string, unknown> | undefined;
    const result = await updateNotificationPreference(
      "user-1",
      { enabledPlatforms: [ContestPlatform.CODECHEF], reminderBeforeMinutes: 30 },
      {
        findNotificationPreference: async () => null,
        upsertNotificationPreference: async (_userId, data) => {
          saved = data;
          return { id: "pref-1", userId: "user-1", ...data } as never;
        },
      }
    );

    assert.deepEqual(saved, {
      notificationsEnabled: true,
      enabledPlatforms: [ContestPlatform.CODECHEF],
      reminderBeforeMinutes: 30,
    });
    assert.deepEqual(result.enabledPlatforms, [ContestPlatform.CODECHEF]);
    assert.deepEqual(result.platforms, [ContestPlatform.CODECHEF]);
  });

  it("accepts the ticket's platforms alias", async () => {
    const result = await updateNotificationPreference(
      "user-1",
      { platforms: [ContestPlatform.ATCODER] },
      {
        findNotificationPreference: async () => null,
        upsertNotificationPreference: async (_userId, data) =>
          ({
            id: "pref-1",
            userId: "user-1",
            ...data,
          }) as never,
      }
    );

    assert.deepEqual(result.platforms, [ContestPlatform.ATCODER]);
    assert.deepEqual(result.enabledPlatforms, [ContestPlatform.ATCODER]);
  });

  it("rejects unsupported, duplicate, and invalid reminder values", () => {
    for (const input of [
      { enabledPlatforms: ["NOT_A_PLATFORM"] },
      { enabledPlatforms: [ContestPlatform.LEETCODE, ContestPlatform.LEETCODE] },
      { platforms: [ContestPlatform.LEETCODE, ContestPlatform.LEETCODE] },
      { reminderBeforeMinutes: 0 },
      { reminderBeforeMinutes: 1.5 },
    ]) {
      assert.equal(updateNotificationPreferenceSchema.safeParse(input).success, false);
    }
  });
});
