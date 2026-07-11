import { prisma } from "../../common/database/prisma.js";

type CreateSessionData = {
  userId: string;
  deviceInfo: string;
  browser: string;
  operatingSystem: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
};

export const createSession = async (data: CreateSessionData) => {
  return prisma.session.create({
    data,
  });
};
