import mongoose from "mongoose";

interface ViewAttr {
  user: string;
  advertId: string;
}

export interface ViewDoc extends mongoose.Document {
  user: string;
  advertId: string;
}

const ViewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    advertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advert",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

interface ViewModel extends mongoose.Model<ViewDoc> {
  build(attr: ViewAttr): ViewDoc;
}

const View = mongoose.model<ViewDoc, ViewModel>("View", ViewSchema);

export { View };
