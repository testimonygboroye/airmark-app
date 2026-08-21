import { z } from "zod";

export const sendTalkbackSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    toUserId: z.string().min(1),
    text: z.string().trim().min(1).max(200),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});
