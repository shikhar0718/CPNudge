import { prisma } from "../../common/database/prisma.js";

type CreateRefreshTokenData = {
  sessionId: string;
  tokenHash: string;
  expiresAt: Date;
};

export const createRefreshToken = async (data: CreateRefreshTokenData) => {
  return prisma.refreshToken.create({
    data,
  });
};

export const findRefreshTokenByHash = async (tokenHash: string) => {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      session: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const revokeRefreshToken = async (id: string) => {
  return prisma.refreshToken.update({
    where: { id },
    data: { isRevoked: true },
  });
};
