import { Request, Response } from "express";
import { Types } from "mongoose";
import { TalkbackMessage } from "../models/TalkbackMessage.model";
import { asyncHandler } from "../utils/asyncHandler";
import { emitToTeam } from "../sockets";
import { createNotification } from "../services/notification.service";

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

  emitToTeam(teamId, "talkback:new", { eventId, message: populated });

  await createNotification({
    userId: toUserId,
    teamId,
    eventId,
    type: "talkback",
    title: "Director cue",
    body: text,
  });

  res.status(201).json({ success: true, data: populated });
});
