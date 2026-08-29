import { z } from "zod";

export const markReadSchema = z.object({
  params: z.object({ notificationId: z.string().min(1) }),
});
