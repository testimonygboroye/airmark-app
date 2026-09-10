import { z } from "zod";

export const saveConfigSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    platformLabel: z.string().trim().min(1).max(60),
    rtmpUrl: z.string().trim().url().refine((v) => v.startsWith("rtmp://") || v.startsWith("rtmps://"), "Must be an rtmp:// or rtmps:// URL"),
    streamKey: z.string().trim().min(1).max(500),
  }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const teamOnlySchema = z.object({
  body: z.object({ teamId: z.string().min(1) }),
  params: z.object({ eventId: z.string().min(1) }),
});
