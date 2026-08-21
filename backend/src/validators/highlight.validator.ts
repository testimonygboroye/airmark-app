import { z } from "zod";

export const createMarkerSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    label: z.string().trim().max(100).optional(),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});
