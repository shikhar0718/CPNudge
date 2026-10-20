import { z } from "zod";
import { ContestPlatform, NotificationDeliveryStatus } from "../../../generated/prisma/enums.js";

const coercePositiveInt = (field: string) =>
  z.coerce
    .number({ message: `${field} must be a number` })
    .int({ message: `${field} must be an integer` })
    .min(1, { message: `${field} must be at least 1` });

export const notificationHistoryQuerySchema = z.object({
  page: coercePositiveInt("page").default(1),
  limit: coercePositiveInt("limit").max(50, { message: "limit must be at most 50" }).default(10),
  platform: z
    .string()
    .toUpperCase()
    .pipe(
      z.enum(ContestPlatform, {
        message: "Invalid platform. Supported: LEETCODE, CODEFORCES, CODECHEF, ATCODER",
      })
    )
    .optional(),
  status: z
    .string()
    .toUpperCase()
    .pipe(
      z.enum(NotificationDeliveryStatus, {
        message: "Invalid status. Supported: PENDING, SENT",
      })
    )
    .optional(),
});

export type NotificationHistoryQueryDto = z.infer<typeof notificationHistoryQuerySchema>;
