import crypto from "crypto";
import argon from "argon2";
import { Prisma } from "../../../generated/prisma/client.js";
import APIError from "../../common/utils/api.erros.js";
import {
  generateAccessToken,
  generateResetToken,
  parseExpiresInToSeconds,
} from "../../common/utils/jwt.utils.js";
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

const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
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

const login = async ({ email, password }: LoginDto) => {
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

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(payload);
  const expiresIn = parseExpiresInToSeconds(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "15m");

  return {
    accessToken,
    expiresIn,
  };
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

export { register, login, verifyEmailToken, deleteUserById };
