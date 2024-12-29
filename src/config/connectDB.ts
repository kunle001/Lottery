import mongoose, { ConnectOptions } from "mongoose";
import { DB_URL } from ".";

export const connectDb = async () => {
  try {
    await mongoose.connect(DB_URL!, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    } as ConnectOptions);

    console.log("DB conected");
  } catch (err) {
    console.log(err);
  }
};
