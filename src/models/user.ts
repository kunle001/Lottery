import mongoose from "mongoose";
import { Password } from "../utils/Password";

interface UserAttr {
  email: string;
  username: string;
  avatar?: string;
  password: string;
  fullName: string;
}

interface UserDoc extends mongoose.Document {
  email: string;
  username: string;
  avatar: string;
  password: string;
  fullName: string;
  prt: string;
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
    password: String,
    fullName: String,
    prt: String,
    tokenExpiresAt: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
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
