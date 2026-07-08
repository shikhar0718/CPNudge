import type { Request, Response } from "express";
import { checkDbHealth } from "./health.service.js";

export async function getHealth(req: Request, res: Response): Promise<void> {
  const dbHealth = await checkDbHealth();
  const isHealthy = dbHealth.status === "UP";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth,
    },
  });
}
