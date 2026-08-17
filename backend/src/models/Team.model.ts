import { Schema, model, Document, Types } from "mongoose";

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Team = model<ITeam>("Team", teamSchema);
