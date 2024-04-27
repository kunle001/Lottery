import "express-async-errors";
import { ConnectOptions } from "mongoose";
import mongoose from "mongoose";
import { app } from "./src/app";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import { getRandomRange } from "./src/utils/randomPicker";

dotenv.config({ path: "./.env" });
// configurer cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
  secure: true,
});

const PORT = process.env.PORT || 3000;

// const [start_num, end] = getRandomRange(0, 12, 10);
// console.log("Random range:", start_num, "-", end);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    } as ConnectOptions);

    console.log("DB conected");
  } catch (err) {
    console.log(err);
  }
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
};

start();
