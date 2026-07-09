import { prisma } from "../../common/database/index.js";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const findUserByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: {
      username,
    },
  });
};

interface CreateUserData {
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName?: string | null;
  hashedToken: string;
}

export const createUserWithVerificationToken = async (data: CreateUserData) => {
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName ?? null,
      timezone: "UTC",
      emailVerificationTokens: {
        create: {
          tokenHash: data.hashedToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      emailVerified: true,
    },
  });
};
