import mongoose from "mongoose";
import { Password } from "../utils/Password";

interface PaymentAttr {
  user: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface PaymentDoc extends mongoose.Document {
  user: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  paystackAccountId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attr: PaymentAttr): PaymentDoc;
}

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    accountNumber: {
      type: String,
      required: [true, "accountNumber is reuired"],
    },
    accountName: {
      type: String,
      required: [true, "accountName is reuired"],
    },
    bankCode: {
      type: String,
      required: [true, "bankCode is reuired"],
    },
    paystackAccountId: String,
    createdAt: {
      type: Date,
      default: new Date(),
    },
    upddatedAt: Date,
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

PaymentSchema.index({ bankCode: 1, accountNumber: 1 }, { unique: true });

PaymentSchema.statics.build = (attrs: PaymentAttr) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  "Payment",
  PaymentSchema
);

export { Payment };
