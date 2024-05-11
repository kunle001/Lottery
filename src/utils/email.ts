import nodemailer from "nodemailer";
import AppError from "./appError";
import { UserDoc } from "../models/user";
import handlebars from "handlebars";
import path from "path";
import fs from "fs";

export const sendEmail = (email: string) => {
  const pass = process.env.EMAIL_PASSWORD;

  const templatePath = path.resolve(__dirname, "template/welcome.hbs");
  const template = fs.readFileSync(templatePath, "utf8");

  const compiledTemplate = handlebars.compile(template);
  const html = compiledTemplate("welcome"); // Pass dynamic data here

  const transporter = nodemailer.createTransport({
    host: String(process.env.HOST),
    // service: String(process.env.SERVICE),
    port: Number(process.env.GMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: pass,
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: `"OTP Verification"${process.env.EMAIL_USERNAME}`,
    to: email,
    subject: "Verify Your Email",
    html: html,
  };

  transporter.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.log(err);
      throw new AppError(err.message, 500);
    }
  });
};
