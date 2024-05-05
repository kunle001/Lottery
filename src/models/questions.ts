import mongoose from "mongoose";
import { Password } from "../utils/Password";

export interface QuestionAttr {
  content: string;
  options: string[];
  awnser: string;
  isconstant?: boolean;
  forDay?: Date;
}

export interface QuestionDoc extends mongoose.Document {
  content: string;
  options: string[];
  awnser: string;
  isconstant?: boolean;
  for_day?: Date;
}

interface QuestionModel extends mongoose.Model<QuestionDoc> {
  build(attr: QuestionAttr): QuestionDoc;
}

const QuestionSchema = new mongoose.Schema(
  {
    content: String,
    password: String,
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

QuestionSchema.index({ for_day: -1 });
QuestionSchema.statics.build = (attrs: QuestionAttr) => {
  return new Question(attrs);
};

QuestionSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password")!);
    this.set("password", hashed);
  }
  done();
});

const Question = mongoose.model<QuestionDoc, QuestionModel>(
  "Question",
  QuestionSchema
);

export { Question };
