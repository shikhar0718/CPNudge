import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"] &
      (string | number),
    algorithm: "HS512",
  });
};

const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? "24h") as SignOptions["expiresIn"] &
      (string | number),
    algorithm: "HS512",
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!);
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET!);
};

const parseExpiresInToSeconds = (expiresIn: string | number): number => {
  if (typeof expiresIn === "number") return expiresIn;
  const match = expiresIn.trim().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 900; // default to 15m (900 seconds)
  const valStr = match[1];
  const unit = match[2];
  if (!valStr || !unit) return 900;
  const value = parseInt(valStr, 10);
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      return 900;
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  parseExpiresInToSeconds,
};
