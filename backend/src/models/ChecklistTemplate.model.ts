import { Schema, model, Document, Types } from "mongoose";

export interface IChecklistItem {
  itemId: string;
  text: string;
}

export interface IChecklistTemplate extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  roleId: Types.ObjectId;
  items: IChecklistItem[];
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const checklistItemSchema = new Schema<IChecklistItem>(
  {
    itemId: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 150 },
  },
  { _id: false }
);

const checklistTemplateSchema = new Schema<IChecklistTemplate>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    items: { type: [checklistItemSchema], default: [] },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

checklistTemplateSchema.index({ teamId: 1, roleId: 1 }, { unique: true });

export const ChecklistTemplate = model<IChecklistTemplate>(
  "ChecklistTemplate",
  checklistTemplateSchema
);
