import { Schema, model, Document, Types } from "mongoose";

export interface IRunOfShowSegment extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  order: number;
  title: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const runOfShowSegmentSchema = new Schema<IRunOfShowSegment>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    order: { type: Number, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

runOfShowSegmentSchema.index({ eventId: 1, order: 1 });

export const RunOfShowSegment = model<IRunOfShowSegment>(
  "RunOfShowSegment",
  runOfShowSegmentSchema
);
