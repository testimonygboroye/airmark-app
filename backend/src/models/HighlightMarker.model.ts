import { Schema, model, Document, Types } from "mongoose";

export interface IHighlightMarker extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  createdBy: Types.ObjectId;
  label?: string;
  offsetSeconds: number;
  createdAt: Date;
}

const highlightMarkerSchema = new Schema<IHighlightMarker>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, trim: true, maxlength: 100 },
    offsetSeconds: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

highlightMarkerSchema.index({ eventId: 1, offsetSeconds: 1 });

export const HighlightMarker = model<IHighlightMarker>(
  "HighlightMarker",
  highlightMarkerSchema
);
