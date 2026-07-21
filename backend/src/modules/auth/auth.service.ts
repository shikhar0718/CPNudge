import argon from "argon2";
import APIError from "../../common/utils/api.erros.js";
import {
  generateAccessToken,
  generateResetToken,
  parseExpiresInToSeconds,
} from "../../common/utils/jwt.utils.js";
import { generateRefreshToken, hashToken } from "../../common/utils/token.utils.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { LoginDto } from "./dto/login.dto.js";
import {
  findUserByEmail,
  findUserByUsername,
  createUserWithVerificationToken,
  deleteUserById,
  findVerificationTokenByHash,
  deleteVerificationToken,
  verifyUserEmail,
} from "./auth.repository.js";

import {
  createSession,
  deleteSession,
  deleteAllSessionsByUserId,
  updateLastActivity,
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
} from "../session/index.js";

import { parseUserAgent } from "../../common/utils/index.js";
import { logger } from "../../common/shared/logger.js";

type RequestMetadata = {
  userAgent: string;
  ipAddress: string;
};

const calculateExpiry = (rememberMe: boolean): Date => {
  const expiresInStr = rememberMe
    ? (process.env.REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN ?? "30d")
    : (process.env.REFRESH_TOKEN_EXPIRES_IN ?? "1d");

  const seconds = parseExpiresInToSeconds(expiresInStr);
  return new Date(Date.now() + seconds * 1000);
};

const register = async ({ firstName, lastName, username, email, password }: RegisterDto) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw APIError.conflict("User with this email already exists");
  }

  const existingUsername = await findUserByUsername(username);
  if (existingUsername) {
    throw APIError.conflict("User with this username already exists");
  }

  const hashedPassword = await argon.hash(password);

  const { rawToken, hashedToken } = generateResetToken();

  const user = await createUserWithVerificationToken({
    username,
    email,
    passwordHash: hashedPassword,
    firstName,
    lastName,
    hashedToken,
  });

  return {
    user,
    rawVerificationToken: rawToken,
  };
};

const login = async (
  { email, password, rememberMe }: LoginDto,
  requestMetadata: RequestMetadata
) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw APIError.unauthorized("Invalid email");
  }

  // Check email verification status
  if (!user.emailVerified) {
    throw APIError.forbidden("Unverified account");
  }

  // Compare password using Argon2
  const isPasswordValid = await argon.verify(user.passwordHash, password);
  if (!isPasswordValid) {
    throw APIError.unauthorized("Incorrect password");
  }

  const { deviceInfo, browser, operatingSystem } = parseUserAgent(requestMetadata.userAgent);

  // Single source of truth for expiry
  const expiry = calculateExpiry(rememberMe);

  const session = await createSession({
    userId: user.id,
    deviceInfo,
    browser,
    operatingSystem,
    userAgent: requestMetadata.userAgent,
    ipAddress: requestMetadata.ipAddress,
    expiresAt: expiry,
  });

  // Generate refresh token — store only the hash
  const rawRefreshToken = generateRefreshToken();
  await createRefreshToken({
    sessionId: session.id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt: expiry,
  });

  // Access token carries sessionId
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    sessionId: session.id,
  };

  const accessToken = generateAccessToken(payload);
  const expiresIn = parseExpiresInToSeconds(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "15m");

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn,
  };
};

const refresh = async (incomingToken: string) => {
  const tokenHash = hashToken(incomingToken);
  const record = await findRefreshTokenByHash(tokenHash);

  if (!record) {
    throw APIError.unauthorized("Invalid refresh token");
  }

  if (record.isRevoked) {
    throw APIError.unauthorized("Refresh token has been revoked");
  }

  if (new Date() > record.expiresAt) {
    throw APIError.unauthorized("Refresh token has expired");
  }

  const { session } = record;

  if (new Date() > session.expiresAt) {
    throw APIError.unauthorized("Session has expired");
  }

  // Rotate: revoke old token
  await revokeRefreshToken(record.id);

  // Generate new refresh token with same expiry
  const rawRefreshToken = generateRefreshToken();
  await createRefreshToken({
    sessionId: session.id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt: record.expiresAt,
  });

  // Fire-and-forget lastActivity update
  void updateLastActivity(session.id).catch((err) => {
    logger.warn("Failed to update session activity", err);
  });

  // New access token
  const { user } = session;
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    sessionId: session.id,
  };

  const accessToken = generateAccessToken(payload);
  const expiresIn = parseExpiresInToSeconds(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "15m");

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn,
  };
};

const logout = async (incomingToken: string) => {
  const tokenHash = hashToken(incomingToken);
  const record = await findRefreshTokenByHash(tokenHash);

  if (!record) {
    throw APIError.unauthorized("Invalid refresh token");
  }

  if (record.isRevoked) {
    throw APIError.unauthorized("Refresh token has been revoked");
  }

  if (new Date() > record.expiresAt) {
    throw APIError.unauthorized("Refresh token has expired");
  }

  // Delete session — cascade deletes all refresh tokens
  await deleteSession(record.sessionId);
};

const logoutAll = async (userId: string) => {
  await deleteAllSessionsByUserId(userId);
};

const verifyEmailToken = async (rawToken: string) => {
  if (!rawToken) {
    throw APIError.badRequest("Verification token is required.");
  }

  const tokenHash = hashToken(rawToken);
  const token = await findVerificationTokenByHash(tokenHash);

  if (!token) {
    throw APIError.badRequest("Verification link is invalid.");
  }

  // Check if already used
  if (token.usedAt) {
    throw APIError.badRequest("Verification link has already been used.");
  }

  // Check expiration
  if (new Date() > token.expiresAt) {
    throw APIError.badRequest("Verification link has expired.");
  }

  // Activate the user and remove the token
  await verifyUserEmail(token.userId);
  await deleteVerificationToken(token.id);
};

export { register, login, refresh, logout, logoutAll, verifyEmailToken, deleteUserById };
