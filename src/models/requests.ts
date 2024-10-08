import mongoose from "mongoose";
import { UserDoc } from "./user";

interface RequestAttr {
  user: string;
  age: number;
  sex: "M" | "F";
}

export interface RequestDoc extends mongoose.Document {
  user: string;
  age: number;
  sex: "M" | "F";
  status: string;
}

interface RequestModel extends mongoose.Model<RequestDoc> {
  build(attr: RequestAttr): RequestDoc;
}

const RequestSchema = new mongoose.Schema(
  {
    user: String,
    age: Number,
    sex: String,
    status: String,
  },

  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

RequestSchema.statics.build = (attrs: RequestAttr) => {
  return new Request(attrs);
};

const Request = mongoose.model<RequestDoc, RequestModel>(
  "Request",
  RequestSchema
);

export { Request };
