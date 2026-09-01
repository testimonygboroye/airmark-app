import { z } from "zod";

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    roleId: z.string().min(1),
  }),
  params: z.object({
    teamId: z.string().min(1),
    membershipId: z.string().min(1),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    teamId: z.string().min(1),
    membershipId: z.string().min(1),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({ name: z.string().trim().min(2).max(120) }),
  params: z.object({ teamId: z.string().min(1) }),
});

export const transferOwnershipSchema = z.object({
  body: z.object({ newOwnerMembershipId: z.string().min(1) }),
  params: z.object({ teamId: z.string().min(1) }),
});

export const deleteTeamSchema = z.object({
  body: z.object({ confirmationText: z.string().min(1) }),
  params: z.object({ teamId: z.string().min(1) }),
});
