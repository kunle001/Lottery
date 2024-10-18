import mongoose from "mongoose";

export interface QuestionAttr {
  content: string;
  options: string[];
  awnser: string;
  isconstant?: boolean;
  // for_day?: Date;
  category?: string;
  image?: string;
}

export interface QuestionDoc extends mongoose.Document {
  content: string;
  options: string[];
  awnser: string;
  image: string;
  isconstant?: boolean;
  for_day?: Date;
  category?: string;
}

interface QuestionModel extends mongoose.Model<QuestionDoc> {
  build(attr: QuestionAttr): QuestionDoc;
}

const QuestionSchema = new mongoose.Schema(
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

QuestionSchema.index({ for_day: -1 });
QuestionSchema.statics.build = (attrs: QuestionAttr) => {
  return new Question(attrs);
};

const Question = mongoose.model<QuestionDoc, QuestionModel>(
  "Question",
  QuestionSchema
);

export { Question };
