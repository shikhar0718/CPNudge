import { prisma } from "../../common/database/index.js";
import type { User } from "../../../generated/prisma/client.js";

export const findUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};
