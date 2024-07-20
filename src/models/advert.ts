import mongoose from "mongoose";
import { Password } from "../utils/Password";

interface AdvertAttr {
  name: string;
  url: string[];
  redirect_url: string;
}

export interface AdvertDoc extends mongoose.Document {
  name: string;
  url: string[];
  redirect_url: string;
}

interface AdvertModel extends mongoose.Model<AdvertDoc> {
  build(attr: AdvertAttr): AdvertDoc;
}

const AdvertSchema = new mongoose.Schema(
  {
    name: String,
    url: [String],
    redirect_url: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

AdvertSchema.statics.build = (attrs: AdvertAttr) => {
  return new Advert(attrs);
};

const Advert = mongoose.model<AdvertDoc, AdvertModel>("Advert", AdvertSchema);

export { Advert };
