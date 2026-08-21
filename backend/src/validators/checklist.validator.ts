import { z } from "zod";

export const setTemplateSchema = z.object({
  body: z.object({
    items: z
      .array(z.object({ text: z.string().trim().min(1).max(150) }))
      .max(30),
  }),
  params: z.object({
    teamId: z.string().min(1),
    roleId: z.string().min(1),
  }),
});

export const toggleItemSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    completed: z.boolean(),
  }),
  params: z.object({
    eventId: z.string().min(1),
    itemId: z.string().min(1),
  }),
});
