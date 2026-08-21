import { Request, Response } from "express";
import { Types } from "mongoose";
import { TalkbackMessage } from "../models/TalkbackMessage.model";
import { asyncHandler } from "../utils/asyncHandler";
import { emitToTeam } from "../sockets";

export const sendTalkback = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId, toUserId, text } = req.body;
  const fromUserId = new Types.ObjectId(req.user!.id);

  const message = await TalkbackMessage.create({
    eventId,
    teamId,
    toUserId,
    fromUserId,
    text,
  });

  const populated = await message.populate("fromUserId", "firstName lastName");

  // Broadcast to the whole team room, but tagged with toUserId — the
  // frontend filters client-side so only the intended operator's screen
  // actually displays it, keeping this targeted rather than team-wide.
  emitToTeam(teamId, "talkback:new", { eventId, message: populated });

  res.status(201).json({ success: true, data: populated });
});
