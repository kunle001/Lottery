import "express-async-errors";
import { ConnectOptions } from "mongoose";
import mongoose from "mongoose";
import { app } from "./src/app";
import cloudinary from "cloudinary";
import {
  createQuestions,
  getRandomRange,
} from "./src/shared/utils/randomPicker";
import { Paystack } from "./src/shared/utils/thirdParty/paystack";
import { startJob } from "./src/shared/utils/cron";
import {
  CLOUDINARY_APIKEY,
  CLOUDINARY_APISECRET,
  CLOUDINARY_NAME,
  DB_URL,
  NODE_ENV,
  PORT,
} from "./src/config";
import { connectDb } from "./src/config/connectDB";

// configurer cloudinary
cloudinary.v2.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_APIKEY,
  api_secret: CLOUDINARY_APISECRET,
  secure: true,
});

// const paystack = new Paystack();
// const PORT = PORT || 3000;

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
  app.listen(PORT, () => {
    startJob();
    console.log(`Listening on port ${PORT}`);
    console.log(
      `============================>>>>>>>>>>>>>>>${NODE_ENV.toUpperCase()} environment`
    );
  });

  connectDb();
};

// createQuestions("questions.json");
// sendEmail("adekunle.olanipekun.ko@gmail.com");
// sendMailController.sendWelcome("adekunle.olanipekun.ko@gmail.com");

start();
