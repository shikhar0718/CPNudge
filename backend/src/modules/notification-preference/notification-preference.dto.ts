import { z } from "zod";
import { ContestPlatform } from "../../../generated/prisma/enums.js";

const platformSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.toUpperCase() : value),
  z.enum(ContestPlatform, {
    message: "Invalid platform. Supported platforms: LEETCODE, CODEFORCES, CODECHEF, ATCODER",
  })
);

export const updateNotificationPreferenceSchema = z
  .object({
    notificationsEnabled: z
      .boolean({ message: "notificationsEnabled must be a boolean" })
      .optional(),
    platforms: z
      .array(platformSchema, {
        message: "platforms must be an array of supported platforms",
      })
      .superRefine((platforms, context) => {
        if (new Set(platforms).size !== platforms.length) {
          context.addIssue({
            code: "custom",
            message: "platforms cannot contain duplicates",
          });
        }
      })
      .optional(),
    enabledPlatforms: z
      .array(platformSchema, {
        message: "enabledPlatforms must be an array of supported platforms",
      })
      .superRefine((platforms, context) => {
        if (new Set(platforms).size !== platforms.length) {
          context.addIssue({
            code: "custom",
            message: "enabledPlatforms cannot contain duplicates",
          });
        }
      })
      .optional(),
    reminderBeforeMinutes: z
      .number({ message: "reminderBeforeMinutes must be a number" })
      .int("reminderBeforeMinutes must be an integer")
      .positive("reminderBeforeMinutes must be greater than 0")
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.platforms && value.enabledPlatforms) {
      const platforms = [...value.platforms].sort();
      const enabledPlatforms = [...value.enabledPlatforms].sort();
      if (platforms.join(",") !== enabledPlatforms.join(",")) {
        context.addIssue({
          code: "custom",
          path: ["platforms"],
          message:
            "platforms and enabledPlatforms must contain the same values when both are provided",
        });
      }
    }
  })
  .strict();

export type UpdateNotificationPreferenceDto = z.infer<typeof updateNotificationPreferenceSchema>;
