import { Request, Response } from "express";
import { Types } from "mongoose";
import { LeaveRequest } from "../models/LeaveRequest.model";
import { Membership } from "../models/Membership.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { createNotification } from "../services/notification.service";
import { WILDCARD_PERMISSION } from "../utils/permissions";

/**
 * Called from teamController.leaveTeam when a live event exists for the
 * team — rather than blocking the request outright, it becomes a
 * director-approved request, so a member can still eventually leave
 * mid-event without silently vanishing from an active broadcast.
 */
export async function createLeaveRequest(teamId: string, userId: string): Promise<void> {
  const existing = await LeaveRequest.findOne({ teamId, userId, status: "pending" });
  if (existing) throw ApiError.conflict("You already have a pending leave request for this team");

  await LeaveRequest.create({ teamId, userId });

  const memberships = await Membership.find({ teamId, status: "active" }).populate("roleId");
  const directors = memberships.filter((m) => {
    const role = m.roleId as any;
    return role?.permissions?.includes(WILDCARD_PERMISSION) || role?.name === "Director" || role?.name === "Team Owner";
  });

  const { User } = await import("../models/User.model");
  const requester = await User.findById(userId);
  const requesterName = requester ? `${requester.firstName} ${requester.lastName}` : "A team member";

  await Promise.all(
    directors.map((m) =>
      createNotification({
        userId: m.userId,
        teamId,
        type: "system",
        title: "Leave-team request during a live event",
        body: `${requesterName} wants to leave the team while an event is live. Review in Team Members.`,
      })
    )
  );
}

export const listLeaveRequests = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const requests = await LeaveRequest.find({ teamId, status: "pending" }).populate("userId", "firstName lastName email");
  res.json({ success: true, data: requests });
});

export const approveLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const requestId = req.params.requestId as string;

  const leaveRequest = await LeaveRequest.findOne({ _id: requestId, teamId, status: "pending" });
  if (!leaveRequest) throw ApiError.notFound("Leave request not found");

  await Membership.deleteOne({ teamId, userId: leaveRequest.userId });
  leaveRequest.status = "approved";
  leaveRequest.resolvedBy = new Types.ObjectId(req.user!.id);
  leaveRequest.resolvedAt = new Date();
  await leaveRequest.save();

  await createNotification({
    userId: leaveRequest.userId,
    teamId,
    type: "system",
    title: "Your request to leave the team was approved",
  });

  res.json({ success: true, message: "Leave request approved — member removed from the team" });
});

export const denyLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const requestId = req.params.requestId as string;

  const leaveRequest = await LeaveRequest.findOne({ _id: requestId, teamId, status: "pending" });
  if (!leaveRequest) throw ApiError.notFound("Leave request not found");

  leaveRequest.status = "denied";
  leaveRequest.resolvedBy = new Types.ObjectId(req.user!.id);
  leaveRequest.resolvedAt = new Date();
  await leaveRequest.save();

  await createNotification({
    userId: leaveRequest.userId,
    teamId,
    type: "system",
    title: "Your request to leave the team was denied",
  });

  res.json({ success: true, message: "Leave request denied" });
});
