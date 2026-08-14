import { z } from "zod";

export const passwordValidation = z
  .string()
  .min(6, "Password must be at least 6characters long.")
  .max(128, "Password cannot exceed 128 characters.")
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter.",
  })
  .refine((password) => /\d/.test(password), {
    message: "Password must contain at least one number.",
  })
  .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
    message: "Password must contain at least one special character.",
  });
