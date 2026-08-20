import { Schema, model, Document, Types } from "mongoose";

export type SignalType = "battery_low" | "need_backup" | "audio_issue" | "custom";

export interface ISignal extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  fromUserId: Types.ObjectId;
  type: SignalType;
  customText?: string;
  acknowledged: boolean;
  acknowledgedBy?: Types.ObjectId;
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const signalSchema = new Schema<ISignal>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["battery_low", "need_backup", "audio_issue", "custom"],
      required: true,
    },
    customText: { type: String, trim: true, maxlength: 100 },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acknowledgedAt: { type: Date },
  },
  { timestamps: true }
);

signalSchema.index({ eventId: 1, acknowledged: 1, createdAt: -1 });

export const Signal = model<ISignal>("Signal", signalSchema);
