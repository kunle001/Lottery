import mongoose from "mongoose";
import { Password } from "../utils/Password";

enum CTAType {
  ussd = "ussd",
  webLink = "web link",
  deepLink = "deep link",
  phoneCall = "phone call",
  email = "email",
  sms = "sms",
  location = "location",
  appStore = "app store",
  playStore = "play store",
  share = "share",
}

interface AdvertAttr {
  name: string;
  url: string[];
  redirect_url: string;
  cta: CTAType;
  buttonText?: string;
}

export interface AdvertDoc extends mongoose.Document {
  name: string;
  url: string[];
  redirect_url: string;
  buttonText?: string;
  cta: CTAType;
}

interface AdvertModel extends mongoose.Model<AdvertDoc> {
  build(attr: AdvertAttr): AdvertDoc;
}

const AdvertSchema = new mongoose.Schema(
  {
    name: String,
    url: [String],
    redirect_url: String,
    views: {
      type: Number,
      default: 0,
    },
    buttonText: String,
    cta: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

AdvertSchema.statics.build = (attrs: AdvertAttr) => {
  return new Advert(attrs);
};

AdvertSchema.virtual("view", {
  ref: "View",
  foreignField: "advertId",
  localField: "_id",
});

const Advert = mongoose.model<AdvertDoc, AdvertModel>("Advert", AdvertSchema);

export { Advert };
