import { z } from "zod";

export const createAssignmentSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    userId: z.string().min(1),
    roleId: z.string().min(1),
    date: z.string().datetime({ message: "Must be a valid ISO 8601 datetime" }),
    note: z.string().trim().max(200).optional(),
  }),
});

export const deleteAssignmentSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
  }),
  params: z.object({
    assignmentId: z.string().min(1),
  }),
});
