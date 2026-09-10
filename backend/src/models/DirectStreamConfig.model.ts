import { Schema, model, Document, Types } from "mongoose";

export interface IDirectStreamConfig extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  platformLabel: string;
  rtmpUrl: string;
  streamKey: string;
  status: "idle" | "connected" | "streaming";
  createdAt: Date;
  updatedAt: Date;
}

const directStreamConfigSchema = new Schema<IDirectStreamConfig>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, unique: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    platformLabel: { type: String, required: true, maxlength: 60 },
    rtmpUrl: { type: String, required: true },
    streamKey: { type: String, required: true, select: false },
    status: { type: String, enum: ["idle", "connected", "streaming"], default: "idle" },
  },
  { timestamps: true }
);

export const DirectStreamConfig = model<IDirectStreamConfig>("DirectStreamConfig", directStreamConfigSchema);
