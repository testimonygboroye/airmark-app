import { Schema, model, Document, Types } from "mongoose";

export interface IChecklistCompletion extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  userId: Types.ObjectId;
  itemId: string;
  completed: boolean;
  completedAt?: Date;
}

const checklistCompletionSchema = new Schema<IChecklistCompletion>({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  itemId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

checklistCompletionSchema.index({ eventId: 1, userId: 1, itemId: 1 }, { unique: true });

export const ChecklistCompletion = model<IChecklistCompletion>(
  "ChecklistCompletion",
  checklistCompletionSchema
);
