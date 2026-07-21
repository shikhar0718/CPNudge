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

export const findSessionById = async (id: string) => {
  return prisma.session.findUnique({
    where: { id },
  });
};

export const updateLastActivity = async (id: string) => {
  return prisma.session.update({
    where: { id },
    data: { lastActivityAt: new Date() },
  });
};

export const deleteSession = async (id: string) => {
  return prisma.session.delete({
    where: { id },
  });
};

export const deleteAllSessionsByUserId = async (userId: string) => {
  return prisma.session.deleteMany({
    where: { userId },
  });
};
