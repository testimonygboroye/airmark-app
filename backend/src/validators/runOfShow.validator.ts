import { z } from "zod";

export const setSegmentsSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    segments: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(120),
          notes: z.string().trim().max(500).optional().or(z.literal("")),
        })
      )
      .min(1)
      .max(50),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});

export const setCurrentSegmentSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    segmentId: z.string().min(1).nullable(),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});
