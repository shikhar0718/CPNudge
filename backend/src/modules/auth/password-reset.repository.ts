import { prisma } from "../../common/database/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";

export const deletePasswordResetTokensByUserId = async (
  userId: string,
  tx?: Prisma.TransactionClient
) => {
  const client = tx ?? prisma;
  return client.passwordResetToken.deleteMany({
    where: { userId },
  });
};

type CreateResetTokenData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export const createPasswordResetToken = async (
  data: CreateResetTokenData,
  tx?: Prisma.TransactionClient
) => {
  const client = tx ?? prisma;
  return client.passwordResetToken.create({
    data,
  });
};

export const findPasswordResetTokenByHash = async (tokenHash: string) => {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: true,
    },
  });
};

export const deletePasswordResetToken = async (id: string, tx?: Prisma.TransactionClient) => {
  const client = tx ?? prisma;
  return client.passwordResetToken.delete({
    where: { id },
  });
};
