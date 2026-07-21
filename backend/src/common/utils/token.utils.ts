import crypto from "crypto";

export const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString("hex");
};
