import { Schema, model, Document, Types } from "mongoose";

export type EventStatus = "scheduled" | "live" | "ended";

export interface IEvent extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  title: string;
  scheduledStart: Date;
  status: EventStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    scheduledStart: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Event = model<IEvent>("Event", eventSchema);
