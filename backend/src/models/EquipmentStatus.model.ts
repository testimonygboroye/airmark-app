import { Schema, model, Document, Types } from "mongoose";

export type EquipmentIssueType = "battery_low" | "storage_full" | "equipment_fault" | "other";
export type EquipmentIssueStatus = "open" | "resolved";

export interface IEquipmentStatus extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  cameraId?: Types.ObjectId;
  reportedBy: Types.ObjectId;
  issueType: EquipmentIssueType;
  note?: string;
  status: EquipmentIssueStatus;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentStatusSchema = new Schema<IEquipmentStatus>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    cameraId: { type: Schema.Types.ObjectId, ref: "CameraAssignment" },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issueType: {
      type: String,
      enum: ["battery_low", "storage_full", "equipment_fault", "other"],
      required: true,
    },
    note: { type: String, trim: true, maxlength: 200 },
    status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const EquipmentStatus = model<IEquipmentStatus>(
  "EquipmentStatus",
  equipmentStatusSchema
);
