import { string } from "joi";
import { API_BASE_URL, JWT_EXPIRES_IN, JWT_KEY } from "../config";
import { UserAttr, UserDoc } from "../models/user";
import { IResetPassword, Isignup } from "../repositories/user/IUser";
import { UserRepository } from "../repositories/user/userRepository";
import AppError from "../shared/utils/appError";
import { EmailService } from "../shared/utils/email";
import { JWT } from "../shared/utils/jwt";
import { Password } from "../shared/utils/Password";
import { TOTP } from "../shared/utils/TOTP";
import { IEmailService } from "../shared/interfaces/email";

interface Ilogin {
  email: string;
  password: string;
}

interface IloginResponse {
  token: string;
  user_data: UserDoc;
}
export class AuthService {
  private userRepository: UserRepository;
  private emailService: IEmailService;

  constructor(repo: UserRepository, email_service: EmailService) {
    this.userRepository = repo;
    this.emailService = email_service;
  }

  private generateToken(): string {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    return token;
  }

  async login(data: Ilogin): Promise<IloginResponse> {
    const exisitingUser = await this.userRepository.findOne(
      "email",
      data.email,
      [
        {
          fieldName: "referrals",
          fieldSubFields: ["email", "fullName"],
        },
      ]
    );

    if (!exisitingUser) {
      throw new AppError(`No registered user with this email`, 400);
    }

    if (exisitingUser.isBlocked) {
      throw new AppError("This user is blocked", 400);
    }

    const passwordCorrect = await Password.compare(
      exisitingUser.password,
      data.password
    );

    if (!passwordCorrect) {
      throw new AppError("incorrect password", 400);
    }

    if (!exisitingUser.ismailVerified) {
      throw new AppError("EMAIL UNVERIFIED", 301);
    }
    const user_data = {
      role: exisitingUser.role,
      id: exisitingUser.id,
      email: exisitingUser.email,
      image: exisitingUser.image,
    };

    const token = JWT.sign(user_data);

    return {
      token,
      user_data: exisitingUser,
    };
  }

  async signUp(data: Isignup) {
    const existingEmail = await this.userRepository.findOne(
      "email",
      data.email
    );

    if (existingEmail) {
      throw new AppError("email already exist", 400);
    }

    const existingUserName = await this.userRepository.findOne(
      "username",
      data.username
    );

    if (existingUserName) {
      throw new AppError("username already exist", 400);
    }

    const evt = this.generateToken();
    const deviceId = data.deviceId;
    if (!deviceId) {
      throw new AppError("deviceId id required", 500);
    }

    let user_attr: UserAttr = {
      fullName: data.fullName,
      username: data.username,
      password: data.password,
      email: data.email,
      zipCode: data.zipCode,
      address: data.address,
      phoneNumber: data.phoneNumber,
      country: data.country,
      evt,
      referalCode: data.referalCode,
      mtExpiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
      deviceId,
    };

    const user_device = await this.userRepository.findMany(
      "deviceId",
      data.deviceId
    );

    //  check referalCode
    let referalCode = data.referalCode;
    if (referalCode) {
      const referee = await this.userRepository.findOne(
        "referalCode",
        referalCode
      );

      if (!referee) {
        throw new AppError("invalid referal code", 400);
      }
      user_attr.refereeId = referee?.id;
      // check if device has not registered more than 3 or 3 accounts, then reward the account
      if (user_device && user_device.length! >= 3) {
        referee.referalBalance += 50;
        await referee.save();
      }
    }
    const user = await this.userRepository.create(user_attr);

    this.emailService.sendEmailVerification(user.email, {
      link: `${process.env.ROOT_URL}/auth/verify-mail/${evt}?email=${data.email}`,
      username: data.username,
      token: evt,
    });
    const jwt_data = {
      id: user.id,
      email: user.email,
      role: "user",
    };
    const jwt = JWT.sign(jwt_data);

    return {
      jwt,
      user,
    };
  }

  async getexistingUser(field: string, value: string): Promise<UserDoc | null> {
    const existingUser = await this.userRepository.findOne(field, value);

    return existingUser;
  }

  async forgotPassword(email: string) {
    const existingUser = await this.userRepository.findOne("email", email);

    if (!existingUser) {
      throw new AppError("user does not exist", 400);
    }
    const token = this.generateToken();

    await this.userRepository.update(existingUser.id, {
      prt: token,
      tokenExpiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    });

    this.emailService.sendToken(existingUser.email, {
      username: existingUser.username,
      token,
    });
  }
  async resetPassword(data: IResetPassword) {
    const exisitingUser = await this.userRepository.findOne(
      "email",
      data.email
    );

    if (!exisitingUser) {
      throw new AppError("No user with this Email", 400);
    }

    if (data.token != exisitingUser.prt) {
      /* prt==> password reset token*/
      throw new AppError("Invalid token", 400);
    }

    const password = await Password.toHash(data.password);

    await this.userRepository.update(exisitingUser.id, {
      password,
      prt: undefined,
      tokenExpiresAt: undefined,
    });
  }

  async verifyEmail(email: string, token: string) {
    const existingUser = await this.userRepository.findOne("email", email);

    if (!existingUser) {
      throw new AppError("No user with this Email", 400);
    }

    if (token != existingUser.evt) {
      throw new AppError("Invalid token", 400);
    }

    if (existingUser.mtExpiresAt < new Date()) {
      throw new AppError("Token is Expired", 400);
    }

    await this.userRepository.update(existingUser.id, {
      ismailVerified: true,
      evt: undefined,
      mtExpiresAt: undefined,
    });

    this.emailService.sendEmailVerified(email, {
      username: existingUser.username,
    });
  }

  async resendEmailVerificationMail(email: string) {
    const existingUser = await this.userRepository.findOne("email", email);

    if (!existingUser) {
      throw new AppError("No user with this Email", 400);
    }

    const evt = this.generateToken();
    await this.userRepository.update(existingUser.id, {
      evt,
      mtExpiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    });

    this.emailService.sendEmailVerification(email, {
      username: existingUser.fullName,
      link: `https://${API_BASE_URL}/api/v1/auth/verify-mail/${evt}?email=${existingUser.email}`,
      token: evt,
    });
  }

  async Setup2fa(userId: string): Promise<string> {
    const twofadetails = TOTP.generateSecret();
    await this.userRepository.update(userId, {
      twofasecret: twofadetails.secret,
    });
    return twofadetails.url!;
  }

  async VerifyTwofaToken(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("user not found", 500);
    }
    const tokenCorrect = TOTP.verifyToken({
      secret: user.twofasecret,
      otp: token,
    });

    if (!tokenCorrect) {
      throw new AppError("incorrect token", 400);
    }
    return tokenCorrect;
  }

  async getToken(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.twofasecret) {
      throw new AppError("User not found or 2FA secret missing", 400);
    }

    const token = TOTP.getToken(user.twofasecret);

    return token;
  }
}
