import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(50, "First name cannot exceed 50 characters.")
      .regex(
        /^[A-Za-z\s'-]+$/,
        "First name can only contain letters, spaces, apostrophes and hyphens."
      ),

    lastName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(50, "First name cannot exceed 50 characters.")
      .regex(
        /^[A-Za-z\s'-]+$/,
        "First name can only contain letters, spaces, apostrophes and hyphens."
      ),

    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username cannot exceed 30 characters.")
      .regex(
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers and underscores."
      ),

    email: z.email("Please enter a valid email address.").trim().lowercase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
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
      }),

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

export type RegisterDto = z.infer<typeof registerSchema>;
