import speakeasy from "speakeasy";
import { APP_NAME } from "../../config";

interface IGenerateSecret {
  url?: string;
  secret: string;
}

interface IVerifyToken {
  secret: string;
  otp: string;
}

export class TOTP {
  static generateSecret(): IGenerateSecret {
    var secret = speakeasy.generateSecret({
      name: APP_NAME,
    });

    return {
      url: secret.otpauth_url,
      secret: secret.base32,
    };
  }

  static verifyToken(data: IVerifyToken): boolean {
    var isVerified = speakeasy.totp.verify({
      secret: data.secret,
      encoding: "base32",
      token: data.otp,
    });

    return isVerified;
  }

  static getToken(secret: string): string {
    var token = speakeasy.totp({
      secret,
      encoding: "base32",
    });

    return token;
  }
}
