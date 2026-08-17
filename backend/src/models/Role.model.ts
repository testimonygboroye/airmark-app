import { Schema, model, Document, Types } from "mongoose";

export interface IRole extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  name: string;
  rank: number;
  permissions: string[];
  isSystemRole: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    rank: { type: Number, required: true, default: 5 },
    permissions: { type: [String], default: [] },
    isSystemRole: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

roleSchema.index({ teamId: 1, name: 1 }, { unique: true });

export const Role = model<IRole>("Role", roleSchema);
