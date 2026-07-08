import { prisma } from "../../common/database/index.js";

export async function checkDbHealth() {
  try {
    // Run a simple query to verify db connection is working
    await prisma.$queryRaw`SELECT 1`;
    return { status: "UP", service: "database" };
  } catch (error) {
    return {
      status: "DOWN",
      service: "database",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
