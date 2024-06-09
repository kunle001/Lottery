import mongoose from "mongoose";
import { Password } from "../utils/Password";

interface AdvertAttr {
  name: string;
  url: string[];
}

export interface AdvertDoc extends mongoose.Document {
  name: string;
  url: string[];
}

interface AdvertModel extends mongoose.Model<AdvertDoc> {
  build(attr: AdvertAttr): AdvertDoc;
}

const AdvertSchema = new mongoose.Schema(
  {
    name: String,
    url: [String],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

AdvertSchema.statics.build = (attrs: AdvertAttr) => {
  return new Advert(attrs);
};

AdvertSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password")!);
    this.set("password", hashed);
  }
  done();
});

const Advert = mongoose.model<AdvertDoc, AdvertModel>("Advert", AdvertSchema);

export { Advert };
