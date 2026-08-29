import { z } from "zod";
import { PERMISSIONS } from "../utils/permissions";

const validPermissionKeys = [...Object.values(PERMISSIONS), "*"] as [string, ...string[]];

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60),
    rank: z.number().int().min(0).max(10),
    permissions: z.array(z.enum(validPermissionKeys)).min(1),
  }),
  params: z.object({ teamId: z.string().min(1) }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60).optional(),
    rank: z.number().int().min(0).max(10).optional(),
    permissions: z.array(z.enum(validPermissionKeys)).min(1).optional(),
  }),
  params: z.object({ teamId: z.string().min(1), roleId: z.string().min(1) }),
});

export const deleteRoleSchema = z.object({
  params: z.object({ teamId: z.string().min(1), roleId: z.string().min(1) }),
});
