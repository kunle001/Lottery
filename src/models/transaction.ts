import mongoose from "mongoose";

export interface TransactionAttr {
  user: string;
  amount: number;
  description: string;
  type: "DR" | "CR";
  reference: string;
  status?: "PENDING" | "FAILED" | "SUCCESSFUL";
}

export interface TransactionDoc extends mongoose.Document {
  user: string;
  amount: number;
  description: string;
  type: "DR" | "CR";
  status?: "PENDING" | "FAILED" | "SUCCESSFUL";
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionModel extends mongoose.Model<TransactionDoc> {
  build(attr: TransactionAttr): TransactionDoc;
}

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: Number,
    description: String,
    type: String,
    status: String,
    reference: {
      type: String,
      unique: [true, "duplicate transaction reference"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

TransactionSchema.statics.build = (attrs: TransactionAttr) => {
  return new Transaction(attrs);
};

const Transaction = mongoose.model<TransactionDoc, TransactionModel>(
  "transaction",
  TransactionSchema
);

export { Transaction };
