import { z } from "zod";

export const refreshSchema = z.object({
  refreshToken: z
    .string({ message: "Refresh token is required" })
    .min(1, "Refresh token cannot be empty"),
});

export type RefreshDto = z.infer<typeof refreshSchema>;
