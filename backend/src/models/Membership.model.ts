import { Schema, model, Document, Types } from "mongoose";

export type MembershipStatus = "active" | "invited" | "suspended";

export interface IMembership extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  teamId: Types.ObjectId;
  roleId: Types.ObjectId;
  status: MembershipStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    status: {
      type: String,
      enum: ["active", "invited", "suspended"],
      default: "active",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);


export const Membership = model<IMembership>("Membership", membershipSchema);
