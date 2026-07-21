import { z } from "zod";
import { passwordValidation } from "./password.schema.js";

export const resetPasswordSchema = z
  .object({
    token: z.string({ message: "Reset token is required" }).min(1, "Reset token cannot be empty"),
    password: passwordValidation,
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
