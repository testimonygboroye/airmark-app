import { z } from "zod";

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
  }),
});
