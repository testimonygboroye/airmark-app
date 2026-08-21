import { Schema, model, Document, Types } from "mongoose";

export interface ITalkbackMessage extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  toUserId: Types.ObjectId;
  fromUserId: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const talkbackMessageSchema = new Schema<ITalkbackMessage>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TalkbackMessage = model<ITalkbackMessage>(
  "TalkbackMessage",
  talkbackMessageSchema
);
