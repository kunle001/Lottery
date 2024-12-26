import { Transporter } from "nodemailer";

export interface IEmailService {
  transporter: Transporter;

  // Method to send a welcome email
  sendWelcome(email: string): void;

  // Method to send an email verification message
  sendEmailVerification(email: string, data: IToken): void;

  // Method to send an email verified confirmation
  sendEmailVerified(email: string, data: IToken): void;

  // Method to send a password reset token
  sendToken(email: string, data: IToken): void;

  // Method to send newsletters
  sendNewsletter(): void;
}

export interface IToken {
  username: string;
  token?: string;
  link?: string;
}
