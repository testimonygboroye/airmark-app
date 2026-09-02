import { Schema, model, Document, Types } from "mongoose";

export type NotificationType = "talkback" | "signal" | "equipment" | "tally" | "ros" | "system";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  teamId: Types.ObjectId;
  eventId?: Types.ObjectId;
  type: NotificationType;
  title: string;
  body?: string;
  senderEmail?: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    type: {
      type: String,
      enum: ["talkback", "signal", "equipment", "tally", "ros", "system"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 150 },
    body: { type: String, maxlength: 300 },
    senderEmail: { type: String },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
