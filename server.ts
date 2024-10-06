import "express-async-errors";
import { ConnectOptions } from "mongoose";
import mongoose from "mongoose";
import { app } from "./src/app";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import { createQuestions, getRandomRange } from "./src/utils/randomPicker";
import { SendEmail } from "./src/utils/email";
import { Paystack } from "./src/utils/thirdParty/paystack";
import { startJob } from "./src/utils/cron";

dotenv.config({ path: "./.env" });
// configurer cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
  secure: true,
});

const paystack = new Paystack();
const PORT = process.env.PORT || 3000;

// paystack
//   .createTransferRecipient({
//     type: "nuban",
//     name: "Olanipekun Adekunle",
//     account_number: "7039365725",
//     bank_code: "999991",
//     currency: "NGN",
//   })
//   .then((res) => {
//     console.log(res);
//   });

// RCP_fjaa5zyp0s1oj4s

// paystack
//   .transferMoney({
//     source: "balance",
//     reason: "Test money",
//     amount: "10000",
//     recipient: "RCP_fjaa5zyp0s1oj4s",
//   })
//   .then((res) => {
//     console.log(res);
//   });

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
    startJob();
    console.log(`Listening on port ${PORT}`);
  });
};

// createQuestions("questions.json");
// sendEmail("adekunle.olanipekun.ko@gmail.com");
// sendMailController.sendWelcome("adekunle.olanipekun.ko@gmail.com");

start();
