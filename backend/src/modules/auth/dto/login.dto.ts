import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email format").trim().toLowerCase(),
  password: z.string({ message: "Password is required" }).min(1, "Password cannot be empty"),
});

export type LoginDto = z.infer<typeof loginSchema>;
