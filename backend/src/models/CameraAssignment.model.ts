import { Schema, model, Document, Types } from "mongoose";

export interface ICameraAssignment extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  cameraNumber: number;
  operatorUserId?: Types.ObjectId;
  label: string;
  isLive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cameraAssignmentSchema = new Schema<ICameraAssignment>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    cameraNumber: { type: Number, required: true, min: 1 },
    operatorUserId: { type: Schema.Types.ObjectId, ref: "User" },
    label: { type: String, trim: true, maxlength: 60, default: "" },
    isLive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

cameraAssignmentSchema.index({ eventId: 1, cameraNumber: 1 }, { unique: true });

export const CameraAssignment = model<ICameraAssignment>(
  "CameraAssignment",
  cameraAssignmentSchema
);
