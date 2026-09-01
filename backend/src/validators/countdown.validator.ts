import { z } from "zod";

export const startCountdownSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    durationSeconds: z.number().int().min(5).max(86400),
  }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const cancelCountdownSchema = z.object({
  body: z.object({ teamId: z.string().min(1) }),
  params: z.object({ eventId: z.string().min(1) }),
});
