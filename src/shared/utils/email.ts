import nodemailer, { Transporter } from "nodemailer";
import AppError from "./appError";
import { UserDoc } from "../../models/user";
import handlebars from "handlebars";
import path from "path";
import fs from "fs";
import { IToken } from "../interfaces/email";

export class EmailService {
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

  private transportmail(mailOptions: any) {
    this.transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
        throw new AppError(err.message, 500);
      }
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

    this.transportmail(mailOptions);
  }

  sendEmailVerified(email: string, data: IToken) {
    const html = this.readTemplate("emailVerified", data);

    const mailOptions = {
      from: `QUIZME${process.env.EMAIL_USERNAME}`,
      to: email,
      subject: "Email Verified",
      html,
    };

    this.transportmail(mailOptions);
  }

  sendEmailVerification(email: string, data: IToken) {
    const html = this.readTemplate("emailVerification", data);

    const mailOptions = {
      from: `QUIZME${process.env.EMAIL_USERNAME}`,
      to: email,
      subject: "Email Verification",
      html,
    };

    this.transportmail(mailOptions);
  }
  sendNewsletter() {
    // Code to send newsletter email
  }

  sendToken(email: string, data: IToken) {
    const html = this.readTemplate("passwordReset", data);

    const mailOptions = {
      from: "QUIZME@mailer.quizmeap.com",
      to: email,
      subject: "Reset Token",
      html,
    };

    this.transportmail(mailOptions);
  }
}
