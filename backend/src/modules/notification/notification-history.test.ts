import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import app from "../../app.js";
import { generateAccessToken } from "../../common/utils/jwt.utils.js";
import {
  ContestPlatform,
  NotificationDeliveryStatus,
  NotificationType,
} from "../../../generated/prisma/enums.js";
import { getNotificationHistory } from "./notification-history.service.js";
import { notificationHistoryQuerySchema } from "./notification-history.validator.js";
import type { NotificationHistoryRecord } from "./notification.types.js";

// ── Helpers ─────────────────────────────────────────────────────

const record = (
  overrides: Partial<NotificationHistoryRecord> & { id: string }
): NotificationHistoryRecord => ({
  userId: "user-1",
  contestId: null,
  platform: ContestPlatform.CODEFORCES,
  notificationType: NotificationType.CONTEST_REMINDER,
  reminderBeforeMinutes: null,
  deliveryStatus: NotificationDeliveryStatus.SENT,
  claimedAt: null,
  sentAt: new Date("2026-10-20T12:00:00.000Z"),
  createdAt: new Date("2026-10-20T12:00:00.000Z"),
  ...overrides,
});

type RepoFn = Parameters<typeof getNotificationHistory>[2];

const stubRepo = (records: NotificationHistoryRecord[], total?: number): NonNullable<RepoFn> => ({
  findNotificationHistory: async () => ({
    records,
    total: total ?? records.length,
  }),
});

// ── Service tests ───────────────────────────────────────────────

describe("notification history service", () => {
  it("returns notifications mapped to the API shape", async () => {
    const r = record({
      id: "n-1",
      platform: ContestPlatform.CODEFORCES,
      notificationType: NotificationType.CONTEST_REMINDER,
      deliveryStatus: NotificationDeliveryStatus.SENT,
      contestId: "contest-1",
    });

    const result = await getNotificationHistory("user-1", { page: 1, limit: 10 }, stubRepo([r]));

    assert.equal(result.notifications.length, 1);
    const item = result.notifications[0]!;
    assert.equal(item.id, "n-1");
    assert.equal(item.notificationType, "CONTEST_REMINDER");
    assert.equal(item.platform, "CODEFORCES");
    assert.equal(item.contestId, "contest-1");
    assert.equal(item.status, "SENT");
    assert.ok(item.sentAt instanceof Date);
    assert.ok(item.createdAt instanceof Date);
  });

  it("returns an empty collection with valid pagination for no results", async () => {
    const result = await getNotificationHistory("user-1", { page: 1, limit: 10 }, stubRepo([]));

    assert.equal(result.notifications.length, 0);
    assert.equal(result.pagination.total, 0);
    assert.equal(result.pagination.totalPages, 1);
    assert.equal(result.pagination.page, 1);
    assert.equal(result.pagination.limit, 10);
  });

  it("calculates pagination metadata correctly", async () => {
    const records = [record({ id: "n-1" }), record({ id: "n-2" })];

    const result = await getNotificationHistory(
      "user-1",
      { page: 2, limit: 2 },
      stubRepo(records, 5)
    );

    assert.equal(result.pagination.page, 2);
    assert.equal(result.pagination.limit, 2);
    assert.equal(result.pagination.total, 5);
    assert.equal(result.pagination.totalPages, 3);
    assert.equal(result.notifications.length, 2);
  });

  it("passes platform filter to the repository", async () => {
    let capturedPlatform: string | undefined;

    const repo: NonNullable<RepoFn> = {
      findNotificationHistory: async (opts) => {
        capturedPlatform = opts.platform;
        return { records: [], total: 0 };
      },
    };

    await getNotificationHistory(
      "user-1",
      { page: 1, limit: 10, platform: ContestPlatform.LEETCODE },
      repo
    );

    assert.equal(capturedPlatform, "LEETCODE");
  });

  it("passes status filter to the repository", async () => {
    let capturedStatus: string | undefined;

    const repo: NonNullable<RepoFn> = {
      findNotificationHistory: async (opts) => {
        capturedStatus = opts.status;
        return { records: [], total: 0 };
      },
    };

    await getNotificationHistory(
      "user-1",
      { page: 1, limit: 10, status: NotificationDeliveryStatus.PENDING },
      repo
    );

    assert.equal(capturedStatus, "PENDING");
  });

  it("does not expose internal fields like claimedAt", async () => {
    const r = record({ id: "n-1", claimedAt: new Date() });

    const result = await getNotificationHistory("user-1", { page: 1, limit: 10 }, stubRepo([r]));

    const item = result.notifications[0] as unknown as Record<string, unknown>;
    assert.equal("claimedAt" in item, false);
    assert.equal("reminderBeforeMinutes" in item, false);
    assert.equal("userId" in item, false);
  });

  it("enforces user isolation — only passes the given userId", async () => {
    let capturedUserId: string | undefined;

    const repo: NonNullable<RepoFn> = {
      findNotificationHistory: async (opts) => {
        capturedUserId = opts.userId;
        return { records: [], total: 0 };
      },
    };

    await getNotificationHistory("user-A", { page: 1, limit: 10 }, repo);
    assert.equal(capturedUserId, "user-A");

    await getNotificationHistory("user-B", { page: 1, limit: 10 }, repo);
    assert.equal(capturedUserId, "user-B");
  });
});

// ── Validator tests ─────────────────────────────────────────────

describe("notification history query validation", () => {
  it("applies defaults for page and limit", () => {
    const result = notificationHistoryQuerySchema.safeParse({});
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.page, 1);
      assert.equal(result.data.limit, 10);
    }
  });

  it("accepts valid page, limit, platform, and status", () => {
    const result = notificationHistoryQuerySchema.safeParse({
      page: "2",
      limit: "25",
      platform: "codeforces",
      status: "sent",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.page, 2);
      assert.equal(result.data.limit, 25);
      assert.equal(result.data.platform, "CODEFORCES");
      assert.equal(result.data.status, "SENT");
    }
  });

  it("rejects page=0", () => {
    const result = notificationHistoryQuerySchema.safeParse({ page: "0" });
    assert.equal(result.success, false);
  });

  it("rejects negative page values", () => {
    const result = notificationHistoryQuerySchema.safeParse({ page: "-1" });
    assert.equal(result.success, false);
  });

  it("rejects decimal page values", () => {
    const result = notificationHistoryQuerySchema.safeParse({ page: "1.5" });
    assert.equal(result.success, false);
  });

  it("rejects limit over 50", () => {
    const result = notificationHistoryQuerySchema.safeParse({ limit: "51" });
    assert.equal(result.success, false);
  });

  it("rejects limit=0", () => {
    const result = notificationHistoryQuerySchema.safeParse({ limit: "0" });
    assert.equal(result.success, false);
  });

  it("rejects unsupported platform", () => {
    const result = notificationHistoryQuerySchema.safeParse({ platform: "HACKERRANK" });
    assert.equal(result.success, false);
  });

  it("rejects unsupported status", () => {
    const result = notificationHistoryQuerySchema.safeParse({ status: "DELIVERED" });
    assert.equal(result.success, false);
  });

  it("accepts all valid platforms", () => {
    for (const p of ["LEETCODE", "CODEFORCES", "CODECHEF", "ATCODER"]) {
      const result = notificationHistoryQuerySchema.safeParse({ platform: p });
      assert.equal(result.success, true, `expected ${p} to be accepted`);
    }
  });

  it("accepts valid statuses", () => {
    for (const s of ["PENDING", "SENT"]) {
      const result = notificationHistoryQuerySchema.safeParse({ status: s });
      assert.equal(result.success, true, `expected ${s} to be accepted`);
    }
  });

  it("is case-insensitive for platform and status", () => {
    const result = notificationHistoryQuerySchema.safeParse({
      platform: "leetcode",
      status: "pending",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.platform, "LEETCODE");
      assert.equal(result.data.status, "PENDING");
    }
  });
});

// ── HTTP Endpoint Integration Tests ─────────────────────────────

describe("notification history HTTP endpoint", () => {
  let server: Server;
  let baseUrl: string;
  let validToken: string;

  before(async () => {
    validToken = generateAccessToken({
      id: "00000000-0000-0000-0000-000000000001",
      email: "test@example.com",
      username: "testuser",
      sessionId: "00000000-0000-0000-0000-000000000002",
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications/history`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as { status: string; message: string };
    assert.equal(body.status, "fail");
    assert.match(body.message, /Missing Authorization header/i);
  });

  it("returns 401 when token is invalid", async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications/history`, {
      headers: { Authorization: "Bearer bad-token-format" },
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as { status: string; message: string };
    assert.equal(body.status, "fail");
  });

  it("returns 400 when page is 0", async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications/history?page=0`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { status: string; message: string };
    assert.equal(body.status, "fail");
    assert.match(body.message, /page must be at least 1/i);
  });

  it("returns 400 when limit exceeds 50", async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications/history?limit=100`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { status: string; message: string };
    assert.equal(body.status, "fail");
    assert.match(body.message, /limit must be at most 50/i);
  });

  it("returns 400 for unsupported platform", async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications/history?platform=UNKNOWN_PLATFORM`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { status: string; message: string };
    assert.equal(body.status, "fail");
    assert.match(body.message, /Invalid platform/i);
  });

  it("returns 400 for unsupported delivery status", async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications/history?status=UNKNOWN_STATUS`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { status: string; message: string };
    assert.equal(body.status, "fail");
    assert.match(body.message, /Invalid status/i);
  });

  it("returns 200 with paginated structure for authenticated request", async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications/history`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      success: boolean;
      message: string;
      data: unknown[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    assert.equal(body.success, true);
    assert.equal(body.message, "Notification history retrieved successfully.");
    assert.ok(Array.isArray(body.data));
    assert.equal(typeof body.pagination.page, "number");
    assert.equal(typeof body.pagination.limit, "number");
    assert.equal(typeof body.pagination.total, "number");
    assert.equal(typeof body.pagination.totalPages, "number");
  });
});
