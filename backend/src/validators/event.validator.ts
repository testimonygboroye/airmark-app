import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    title: z.string().trim().min(2).max(120),
    scheduledStart: z.string().datetime({ message: "Must be a valid ISO 8601 datetime" }),
    cameraCount: z.number().int().min(1).max(20),
  }),
});

export const setTallySchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
  }),
  params: z.object({
    eventId: z.string().min(1),
    cameraId: z.string().min(1),
  }),
});

export const assignOperatorSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    operatorUserId: z.string().min(1).nullable(),
  }),
  params: z.object({
    eventId: z.string().min(1),
    cameraId: z.string().min(1),
  }),
});

export const eventStatusSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});
