import { Schema, model, Document, Types } from "mongoose";

export type LeaveRequestStatus = "pending" | "approved" | "denied";

export interface ILeaveRequest extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  userId: Types.ObjectId;
  status: LeaveRequestStatus;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "denied"], default: "pending" },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LeaveRequest = model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);
