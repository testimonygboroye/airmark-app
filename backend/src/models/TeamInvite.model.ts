import { Schema, model, Document, Types } from "mongoose";

export type TeamInviteStatus = "pending" | "accepted" | "expired";

export interface ITeamInvite extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  email: string;
  roleId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  tokenHash: string;
  status: TeamInviteStatus;
  expiresAt: Date;
  isOwnershipTransfer: boolean;
  previousOwnerMembershipId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamInviteSchema = new Schema<ITeamInvite>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "accepted", "expired"], default: "pending" },
    expiresAt: { type: Date, required: true },
    isOwnershipTransfer: { type: Boolean, default: false },
    previousOwnerMembershipId: { type: Schema.Types.ObjectId, ref: "Membership" },
  },
  { timestamps: true }
);

export const TeamInvite = model<ITeamInvite>("TeamInvite", teamInviteSchema);
