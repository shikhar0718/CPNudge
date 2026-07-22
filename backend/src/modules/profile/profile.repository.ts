import { prisma } from "../../common/database/index.js";
import { ContestPlatform, Prisma } from "../../../generated/prisma/client.js";
import type { CreateLinkedProfileDto } from "./dto/create-linked-profile.dto.js";
import APIError from "../../common/utils/api.errors.js";

export const createLinkedProfile = async (userId: string, data: CreateLinkedProfileDto) => {
  try {
    return await prisma.linkedPlatformAccount.create({
      data: {
        userId,
        platform: data.platform,
        username: data.username,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw APIError.conflict("You have already linked a profile for this platform.");
    }
    throw error;
  }
};

export const findLinkedProfile = async (userId: string, platform: ContestPlatform) => {
  return await prisma.linkedPlatformAccount.findUnique({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
  });
};

export const updateLinkedProfile = async (
  userId: string,
  platform: ContestPlatform,
  username: string
) => {
  return await prisma.linkedPlatformAccount.update({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
    data: {
      username,
    },
  });
};

export const deleteLinkedProfile = async (userId: string, platform: ContestPlatform) => {
  return await prisma.linkedPlatformAccount.delete({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
  });
};

export const getUserLinkedProfiles = async (userId: string) => {
  return await prisma.linkedPlatformAccount.findMany({
    where: {
      userId,
    },
  });
};
