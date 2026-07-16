import { z } from "zod";
import { ContestPlatform, ContestStatus } from "../../../../generated/prisma/enums.js";

export const contestQuerySchema = z.object({
  platform: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase() : val),
      z.enum(ContestPlatform, {
        message: "Invalid platform. Supported platforms: LEETCODE, CODEFORCES, CODECHEF, ATCODER",
      })
    )
    .optional(),

  status: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase() : val),
      z.enum(ContestStatus, {
        message: "Invalid status. Supported statuses: UPCOMING, ONGOING, FINISHED, CANCELLED",
      })
    )
    .optional(),

  search: z.string().trim().optional(),

  sortBy: z
    .enum(["startTime", "endTime", "duration", "title"], {
      message: "Invalid sortBy field. Supported fields: startTime, endTime, duration, title",
    })
    .default("startTime"),

  order: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase() : val),
      z.enum(["asc", "desc"], {
        message: "Invalid order. Supported: asc, desc",
      })
    )
    .default("asc"),

  page: z
    .preprocess(
      (val) => {
        if (val === undefined || val === "") return undefined;
        const parsed = Number(val);
        return isNaN(parsed) ? val : parsed;
      },
      z
        .number({ message: "Page must be a number" })
        .int("Page must be an integer")
        .positive("Page must be greater than 0")
    )
    .default(1),

  limit: z
    .preprocess(
      (val) => {
        if (val === undefined || val === "") return undefined;
        const parsed = Number(val);
        return isNaN(parsed) ? val : parsed;
      },
      z
        .number({ message: "Limit must be a number" })
        .int("Limit must be an integer")
        .positive("Limit must be greater than 0")
    )
    .default(10),
});

export type ContestQueryDto = z.infer<typeof contestQuerySchema>;
