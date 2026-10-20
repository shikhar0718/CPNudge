import { prisma } from "../../common/database/index.js";
import type { Prisma } from "../../../generated/prisma/client.js";

export const findNotificationPreference = async (userId: string) =>
  prisma.notificationPreference.findUnique({ where: { userId } });

export const upsertNotificationPreference = async (
  userId: string,
  data: Omit<Prisma.NotificationPreferenceUncheckedCreateInput, "userId">
) =>
  prisma.notificationPreference.upsert({
    where: { userId },
    create: { ...data, userId },
    update: data,
  });
