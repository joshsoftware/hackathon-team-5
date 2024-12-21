import { z } from "zod";

export const linkSchema = z.object({
  url: z.string().url(),
  action_type: z.string(),
});

export type SignupUserRequest = z.infer<typeof linkSchema>;