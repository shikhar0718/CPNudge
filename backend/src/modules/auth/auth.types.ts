import type { Request } from "express";

export interface AuthPayload {
  id: string;
  email: string;
  username: string;
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthPayload;
}
