import mongoose from "mongoose";

export interface NotificationAttr {
  user: string;
  message: string;
}

export interface NotificationDoc extends mongoose.Document {
  user: string;
  message: string;
  createdAt: Date;
}

interface NotificationModel extends mongoose.Model<NotificationDoc> {
  build(attr: NotificationAttr): NotificationDoc;
}

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

NotificationSchema.index({ for_day: -1 });
NotificationSchema.statics.build = (attrs: NotificationAttr) => {
  return new Notification(attrs);
};

const Notification = mongoose.model<NotificationDoc, NotificationModel>(
  "Notification",
  NotificationSchema
);

export { Notification };
