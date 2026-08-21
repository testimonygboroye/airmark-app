import { z } from "zod";

export const pairSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});

export const setSceneSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    sceneName: z.string().trim().min(1).max(200),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});
