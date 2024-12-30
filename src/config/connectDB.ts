import mongoose, { ConnectOptions } from "mongoose";
import { DB_URL, NODE_ENV, PROD_DB_URL } from ".";

export const connectDb = async () => {
  try {
    await mongoose.connect(NODE_ENV == "development" ? DB_URL! : PROD_DB_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    } as ConnectOptions);

    console.log("DB conected");
  } catch (err) {
    console.log(err);
  }
};
