import mongoose from "mongoose";
import { Password } from "../utils/Password";

interface QuestionAttr {
    content: string
    options: string[]
    awnser: string
}

export interface QuestionDoc extends mongoose.Document {
    content: string
    options: string[]
    awnser: string
}

interface QuestionModel extends mongoose.Model<QuestionDoc> {
    build(attr: QuestionAttr): QuestionDoc
}

const QuestionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required"]
    },
    Questionname: String,
    password: String,
    options: [String],
    prt: String,
    tokenExpiresAt: Date
},
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

QuestionSchema.statics.build = (attrs: QuestionAttr) => {
    return new Question(attrs);
};

QuestionSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
      const hashed = await Password.toHash(this.get('password')!);
      this.set('password', hashed)
    };
    done();
  });
  
  
const Question = mongoose.model<QuestionDoc, QuestionModel>('Question', QuestionSchema);
  
  export { Question };
  