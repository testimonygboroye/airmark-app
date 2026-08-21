import { Request, Response } from "express";
import crypto from "crypto";
import { Types } from "mongoose";
import { ChecklistTemplate } from "../models/ChecklistTemplate.model";
import { ChecklistCompletion } from "../models/ChecklistCompletion.model";
import { Membership } from "../models/Membership.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const setTemplate = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const roleId = req.params.roleId as string;
  const { items } = req.body;
  const updatedBy = new Types.ObjectId(req.user!.id);

  const itemDocs = items.map((i: { text: string }) => ({
    itemId: crypto.randomUUID(),
    text: i.text,
  }));

  const template = await ChecklistTemplate.findOneAndUpdate(
    { teamId, roleId },
    { items: itemDocs, updatedBy },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: template });
});

export const getTemplate = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const roleId = req.params.roleId as string;

  const template = await ChecklistTemplate.findOne({ teamId, roleId });
  res.json({ success: true, data: template ?? { items: [] } });
});

/**
 * Returns the current user's checklist for this event — resolved from
 * their team role's template, merged with their per-event completion
 * state. No template configured for their role means an empty list, not
 * an error, since not every role needs a checklist.
 */
export const getMyEventChecklist = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const teamId = req.query.teamId as string | undefined;
  if (!teamId) throw ApiError.badRequest("teamId query parameter is required");

  const membership = await Membership.findOne({
    userId: req.user!.id,
    teamId,
    status: "active",
  });
  if (!membership) throw ApiError.forbidden("Not a member of this team");

  const template = await ChecklistTemplate.findOne({ teamId, roleId: membership.roleId });
  const items = template?.items ?? [];

  const completions = await ChecklistCompletion.find({ eventId, userId: req.user!.id });
  const completionMap = new Map(completions.map((c) => [c.itemId, c]));

  const merged = items.map((item) => ({
    itemId: item.itemId,
    text: item.text,
    completed: completionMap.get(item.itemId)?.completed ?? false,
  }));

  res.json({ success: true, data: merged });
});

export const toggleItem = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const itemId = req.params.itemId as string;
  const { teamId, completed } = req.body;
  const userId = new Types.ObjectId(req.user!.id);

  await ChecklistCompletion.findOneAndUpdate(
    { eventId, userId, itemId },
    { teamId, completed, completedAt: completed ? new Date() : undefined },
    { upsert: true }
  );

  res.json({ success: true });
});

/**
 * Director-facing readiness view: every active team member, their
 * checklist size, and how many items they've completed for this event.
 */
export const getEventReadiness = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const teamId = req.query.teamId as string | undefined;
  if (!teamId) throw ApiError.badRequest("teamId query parameter is required");

  const memberships = await Membership.find({ teamId, status: "active" })
    .populate("userId", "firstName lastName")
    .populate("roleId", "name");

  const results = await Promise.all(
    memberships.map(async (m) => {
      const template = await ChecklistTemplate.findOne({ teamId, roleId: m.roleId });
      const totalItems = template?.items.length ?? 0;

      if (totalItems === 0) {
        return {
          userId: (m.userId as any)._id,
          name: `${(m.userId as any).firstName} ${(m.userId as any).lastName}`,
          role: (m.roleId as any).name,
          totalItems: 0,
          completedItems: 0,
        };
      }

      const completedCount = await ChecklistCompletion.countDocuments({
        eventId,
        userId: (m.userId as any)._id,
        completed: true,
        itemId: { $in: template!.items.map((i) => i.itemId) },
      });

      return {
        userId: (m.userId as any)._id,
        name: `${(m.userId as any).firstName} ${(m.userId as any).lastName}`,
        role: (m.roleId as any).name,
        totalItems,
        completedItems: completedCount,
      };
    })
  );

  res.json({ success: true, data: results.filter((r) => r.totalItems > 0) });
});
