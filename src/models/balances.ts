import mongoose from "mongoose";
import { UserDoc } from "./user";

export interface BalanceAttr {
  day: Date;
  balance: number;
  user: string | UserDoc;
}

export interface BalanceDoc extends mongoose.Document {
  day: Date;
  balance: number;
  user: string | UserDoc;
}

interface BalanceModel extends mongoose.Model<BalanceDoc> {
  build(attr: BalanceAttr): BalanceDoc;
}

const BalanceSchema = new mongoose.Schema(
  {
    content: String,
    password: String,
    image: String,
    options: [String],
    awnser: {
      type: String,
      required: [true, "awnser is required"],
    },
    prt: String,
    isconstant: {
      type: Boolean,
      default: false,
    },
    for_day: {
      type: Date,
      default: new Date(),
    },
    category: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

BalanceSchema.index({ for_day: -1 });
BalanceSchema.statics.build = (attrs: BalanceAttr) => {
  return new Balance(attrs);
};

const Balance = mongoose.model<BalanceDoc, BalanceModel>(
  "Balance",
  BalanceSchema
);

export { Balance };
