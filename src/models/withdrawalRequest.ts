import mongoose from "mongoose";
import { UserDoc } from "./user";

interface WithdrawalAttr {
  user: string;
  amount: number;
  reference: string;
  source: "referalBalance" | "walletBalance";
}

export interface WithdrawalDoc extends mongoose.Document {
  user: string | UserDoc;
  amount: number;
  status: "APPROVED" | "DISAPPROVED" | "PENDING";
  approvedBy: string;
  approvedAt: string;
  reference: string;
  source: "referalBalance" | "walletBalance";
}

interface WithdrawalModel extends mongoose.Model<WithdrawalDoc> {
  build(attr: WithdrawalAttr): WithdrawalDoc;
}

const WithdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: Number,
    status: {
      type: String,
      default: "PENDING",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: String,
    source: String,
    reference: String,
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

WithdrawalSchema.statics.build = (attrs: WithdrawalAttr) => {
  return new Withdrawal(attrs);
};

const Withdrawal = mongoose.model<WithdrawalDoc, WithdrawalModel>(
  "Withdrawal",
  WithdrawalSchema
);

export { Withdrawal };
