import { z } from "zod";

export const sendSignalSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    type: z.enum(["battery_low", "need_backup", "audio_issue", "custom"]),
    customText: z.string().trim().max(100).optional(),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});

export const acknowledgeSignalSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
  }),
  params: z.object({
    eventId: z.string().min(1),
    signalId: z.string().min(1),
  }),
});
