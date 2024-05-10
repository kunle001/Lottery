import mongoose from "mongoose";
import { Password } from "../utils/Password";

interface UserAttr {
  email: string;
  username: string;
  avatar?: string;
  password: string;
  interest?: string[];
  fullName: string;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  username: string;
  avatar: string;
  password: string;
  fullName: string;
  prt: string;
  interest: string[];
  tokenExpiresAt: Date;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attr: UserAttr): UserDoc;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email already exist"],
    },
    username: {
      type: String,
      unique: [true, "username already exist"],
    },
    interests: {
      type: [String],
      default: [],
    },
    password: String,
    fullName: String,
    prt: String,
    tokenExpiresAt: Date,
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
  }
);

UserSchema.statics.build = (attrs: UserAttr) => {
  return new User(attrs);
};

UserSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password")!);
    this.set("password", hashed);
  }
  done();
});

const User = mongoose.model<UserDoc, UserModel>("User", UserSchema);

export { User };
