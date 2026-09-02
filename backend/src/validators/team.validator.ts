import { z } from "zod";

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, "Team name must be at least 3 characters").max(80, "Team name can't exceed 80 characters"),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({ roleId: z.string().min(1) }),
  params: z.object({ teamId: z.string().min(1), membershipId: z.string().min(1) }),
});

export const removeMemberSchema = z.object({
  params: z.object({ teamId: z.string().min(1), membershipId: z.string().min(1) }),
});

export const updateTeamSchema = z.object({
  body: z.object({ name: z.string().trim().min(3, "Team name must be at least 3 characters").max(80, "Team name can't exceed 80 characters") }),
  params: z.object({ teamId: z.string().min(1) }),
});

export const transferOwnershipByEmailSchema = z.object({
  body: z.object({ email: z.string().trim().toLowerCase().email() }),
  params: z.object({ teamId: z.string().min(1) }),
});

export const deleteTeamSchema = z.object({
  body: z.object({ confirmationText: z.string().min(1) }),
  params: z.object({ teamId: z.string().min(1) }),
});
