import crypto from "crypto";
import argon from "argon2";
import { Prisma } from "../../../generated/prisma/client.js";
import APIError from "../../common/utils/api.erros.js";
import { generateAccessToken, generateResetToken } from "../../common/utils/jwt.utils.js";
import type { RegisterDto } from "./dto/register.dto.js";
import {
  findUserByEmail,
  findUserByUsername,
  createUserWithVerificationToken,
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

export { register };
