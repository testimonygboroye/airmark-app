import { Schema, model, Document, Types } from "mongoose";

export type ObsConnectionStatus = "disconnected" | "connected";

export interface IObsScene {
  sceneName: string;
  sceneIndex: number;
}

export interface IObsSceneItem {
  sceneItemId: number;
  sourceName: string;
  sceneItemEnabled: boolean;
}

export interface IObsStreamStatus {
  active: boolean;
  outputSkippedFrames: number;
  outputTotalFrames: number;
}

export interface IObsRecordStatus {
  active: boolean;
}

export interface IObsConnection extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  status: ObsConnectionStatus;
  obsVersion?: string;
  currentProgramScene?: string;
  scenes: IObsScene[];
  transitions: string[];
  currentTransition?: string;
  transitionDurationMs?: number;
  sceneItems: IObsSceneItem[];
  fallbackSceneName?: string;
  watermarkSceneItemId?: number;
  streamStatus?: IObsStreamStatus;
  recordStatus?: IObsRecordStatus;
  connectedAt?: Date;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const obsSceneSchema = new Schema<IObsScene>(
  { sceneName: { type: String, required: true }, sceneIndex: { type: Number, required: true } },
  { _id: false }
);

const obsSceneItemSchema = new Schema<IObsSceneItem>(
  {
    sceneItemId: { type: Number, required: true },
    sourceName: { type: String, required: true },
    sceneItemEnabled: { type: Boolean, required: true },
  },
  { _id: false }
);

const obsStreamStatusSchema = new Schema<IObsStreamStatus>(
  {
    active: { type: Boolean, default: false },
    outputSkippedFrames: { type: Number, default: 0 },
    outputTotalFrames: { type: Number, default: 0 },
  },
  { _id: false }
);

const obsRecordStatusSchema = new Schema<IObsRecordStatus>(
  { active: { type: Boolean, default: false } },
  { _id: false }
);

const obsConnectionSchema = new Schema<IObsConnection>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, unique: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    status: { type: String, enum: ["disconnected", "connected"], default: "disconnected" },
    obsVersion: { type: String },
    currentProgramScene: { type: String },
    scenes: { type: [obsSceneSchema], default: [] },
    transitions: { type: [String], default: [] },
    currentTransition: { type: String },
    transitionDurationMs: { type: Number },
    sceneItems: { type: [obsSceneItemSchema], default: [] },
    fallbackSceneName: { type: String },
    watermarkSceneItemId: { type: Number },
    streamStatus: { type: obsStreamStatusSchema },
    recordStatus: { type: obsRecordStatusSchema },
    connectedAt: { type: Date },
    lastSeenAt: { type: Date },
  },
  { timestamps: true }
);

export const ObsConnection = model<IObsConnection>("ObsConnection", obsConnectionSchema);
