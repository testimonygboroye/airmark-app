import { Schema, model, Document, Types } from "mongoose";

export interface IScheduleAssignment extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  date: Date;
  note?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleAssignmentSchema = new Schema<IScheduleAssignment>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    date: { type: Date, required: true, index: true },
    note: { type: String, trim: true, maxlength: 200 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const ScheduleAssignment = model<IScheduleAssignment>(
  "ScheduleAssignment",
  scheduleAssignmentSchema
);
