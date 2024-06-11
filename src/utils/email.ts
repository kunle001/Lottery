import nodemailer, { Transporter } from "nodemailer";
import AppError from "./appError";
import { UserDoc } from "../models/user";
import handlebars from "handlebars";
import path from "path";
import fs from "fs";

interface IToken {
  username: string;
  token?: string;
  link?: string;
}

export class SendEmail {
  transporter: Transporter;

  constructor() {
    // Initialize transporter here if needed
    this.transporter = nodemailer.createTransport({
      host: String(process.env.HOST),
      // service: String(process.env.SERVICE),
      port: Number(process.env.GMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  private readTemplate(name: string, data?: any): string {
    const templatePath = path.resolve(__dirname, `template/${name}.hbs`);
    const template = fs.readFileSync(templatePath, "utf8");

    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  sendWelcome(email: string) {
    const html = this.readTemplate("welcome");

    const mailOptions = {
      from: `"Welcome To quizME"${process.env.EMAIL_USERNAME}`,
      to: email,
      subject: "Welcome",
      html,
    };

    this.transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
        throw new AppError(err.message, 500);
      }
    });
  }

  sendEmailVerified(email: string, data: IToken) {
    const html = this.readTemplate("emailVerified", data);

    const mailOptions = {
      from: `"EMAIL VERIFIED"${process.env.EMAIL_USERNAME}`,
      to: email,
      subject: "Email Verified",
      html,
    };

    this.transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
        throw new AppError(err.message, 500);
      }
    });
  }

  sendEmailVerification(email: string, data: IToken) {
    const html = this.readTemplate("emailVerification", data);

    const mailOptions = {
      from: `"EMAIL Verification"${process.env.EMAIL_USERNAME}`,
      to: email,
      subject: "Email Verification",
      html,
    };

    this.transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
        throw new AppError(err.message, 500);
      }
    });
  }
  sendNewsletter() {
    // Code to send newsletter email
  }

  sendToken(email: string, data: IToken) {
    const html = this.readTemplate("passwordReset", data);

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Reset Token",
      html,
    };

    this.transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
        throw new AppError(err.message, 500);
      }
    });
  }
}
