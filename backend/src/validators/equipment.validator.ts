import { z } from "zod";

export const reportIssueSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    cameraId: z.string().min(1).optional(),
    issueType: z.enum(["battery_low", "storage_full", "equipment_fault", "other"]),
    note: z.string().trim().max(200).optional(),
  }),
  params: z.object({
    eventId: z.string().min(1),
  }),
});

export const resolveIssueSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
  }),
  params: z.object({
    eventId: z.string().min(1),
    issueId: z.string().min(1),
  }),
});
