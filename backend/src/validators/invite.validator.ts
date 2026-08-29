import { z } from "zod";

export const createInviteSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    roleId: z.string().min(1),
  }),
  params: z.object({ teamId: z.string().min(1) }),
});

export const checkInviteSchema = z.object({
  params: z.object({ token: z.string().min(1) }),
});
