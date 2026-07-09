import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m") as unknown,
    algorithm: "HS512",
  });
};

const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "24h") as unknown,
    algorithm: "HS512",
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!);
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET!);
};

const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  return { rawToken, hashedToken };
};

export {
  generateResetToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
