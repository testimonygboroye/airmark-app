import { z } from "zod";

export const pairSchema = z.object({
  body: z.object({ teamId: z.string().min(1) }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const setSceneSchema = z.object({
  body: z.object({ teamId: z.string().min(1), sceneName: z.string().trim().min(1).max(200) }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const setTransitionSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    transitionName: z.string().trim().min(1).max(100),
    transitionDurationMs: z.number().int().min(0).max(10000).optional(),
  }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const toggleSceneItemSchema = z.object({
  body: z.object({ teamId: z.string().min(1), enabled: z.boolean() }),
  params: z.object({ eventId: z.string().min(1), sceneItemId: z.string().min(1) }),
});

export const setTextSourceSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    sourceName: z.string().trim().min(1).max(200),
    text: z.string().trim().max(500),
  }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const setFallbackSceneSchema = z.object({
  body: z.object({ teamId: z.string().min(1), sceneName: z.string().trim().min(1).max(200) }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const teamOnlySchema = z.object({
  body: z.object({ teamId: z.string().min(1) }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const setWatermarkSchema = z.object({
  body: z.object({ teamId: z.string().min(1), sceneItemId: z.number().int() }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const startCountdownOverlaySchema = z.object({
  body: z.object({ teamId: z.string().min(1), sourceName: z.string().trim().min(1).max(200) }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const audioMuteSchema = z.object({
  body: z.object({ teamId: z.string().min(1), inputName: z.string().trim().min(1).max(200), muted: z.boolean() }),
  params: z.object({ eventId: z.string().min(1) }),
});

export const audioVolumeSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    inputName: z.string().trim().min(1).max(200),
    volumeDb: z.number().min(-100).max(26),
  }),
  params: z.object({ eventId: z.string().min(1) }),
});
