import { z } from "zod";

export const linkSchema = z.object({
  url: z.string().url(),
});

export type SignupUserRequest = z.infer<typeof linkSchema>;