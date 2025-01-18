import { Request, Response, NextFunction } from "express";
import AppError from "../shared/utils/appError";
import jwt from "jsonwebtoken";
import { UserPayload, signToken } from "../shared/utils/validators";
import { User } from "../models/user";
import { Password } from "../shared/utils/Password";
import { sendSuccess } from "../shared/utils/response";
import { catchAsync } from "../shared/utils/catchAsync";
import axios from "axios";
import dotenv from "dotenv";
import speakeasy from "speakeasy";
import { EmailService } from "../shared/utils/email";
import { JWT_EXPIRES_IN, JWT_KEY } from "../config";
import { AuthService } from "../services/authService";
import { UserRepository } from "../repositories/user/userRepository";

dotenv.config({ path: "./.env" });

interface FacebbokUserDetails {
  id: string;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  birthday: string;
}

export class AuthController {
  private userRepo: UserRepository;
  private userService: AuthService;

  constructor() {
    this.userRepo = new UserRepository(User);
    this.userService = new AuthService(this.userRepo, new EmailService());
  }

  private generateToken(): string {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    return token;
  }
  public login = catchAsync(async (req: Request, res: Response) => {
    // Implementation for login
    const { email, password } = req.body;

    const user = await this.userService.login({
      email,
      password,
    });

    sendSuccess(res, 200, {
      token: user.token,
      user_data: user.user_data,
    });
  });

  public signup = catchAsync(async (req: Request, res: Response) => {
    // Implementation for signup
    let {
      fullName,
      username,
      email,
      password,
      zipCode,
      address,
      phoneNumber,
      country,
      deviceId,
      referalCode,
    } = req.body;

    const user = await this.userService.signUp({
      fullName,
      username,
      email,
      password,
      zipCode,
      address,
      phoneNumber,
      country,
      deviceId,
      referalCode,
    });

    sendSuccess(res, 201, {
      ...user,
    });
  });

  public existingUsername = catchAsync(async (req: Request, res: Response) => {
    const value = (req.query.email || req.query.username) as string;
    const existingUser = await this.userService.getexistingUser(
      req.query.email ? "email" : "username",
      value
    );
    sendSuccess(res, 200, {
      userExists: existingUser ? true : false,
    });
  });

  public existingEmail = catchAsync(async (req: Request, res: Response) => {
    // Implementation for forgotPassword
  });

  public forgotPassword = catchAsync(async (req: Request, res: Response) => {
    // Implementation for forgotPassword
    // const exisitingUser = await User.findOne({
    //   email: req.body.email,
    // });

    // if (!exisitingUser) {
    //   throw new AppError("No user with this Email", 400);
    // }

    // const token = this.generateToken();

    // exisitingUser.set({
    //   prt: token,
    //   tokenExpiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    // });
    // await exisitingUser.save();
    // this.sendToken(exisitingUser.email, {
    //   username: exisitingUser.username,
    //   token,
    // });

    const { email } = req.body;

    this.userService.forgotPassword(email);
    sendSuccess(res, 200, "Token sent");
  });

  public resetPassword = catchAsync(async (req: Request, res: Response) => {
    // Implementation for resetPassword
    const { email, token, password } = req.body;
    // const exisitingUser = await User.findOne({
    //   email: req.body.email,
    // });

    // if (!exisitingUser) {
    //   throw new AppError("No user with this Email", 400);
    // }

    // if (token != exisitingUser.prt) {
    //   throw new AppError("Invalid token", 400);
    // }

    // if (exisitingUser.tokenExpiresAt < new Date()) {
    //   throw new AppError("token is Expired", 400);
    // }

    // exisitingUser.set({
    //   password,
    //   prt: undefined,
    //   tokenExpiresAt: undefined,
    // });

    // await exisitingUser.save();
    await this.userService.resetPassword({
      email,
      password,
      token,
    });
    sendSuccess(res, 200, "Password Reset successfully");
  });

  public currentUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.headers.authorization) {
        return next();
      }

      const isAuthenticated = jwt.verify(
        req.headers.authorization,
        process.env.JWTKEY!
      ) as UserPayload;

      req.currentUser = isAuthenticated;

      next();
    }
  );

  public requireAuth = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.currentUser) {
        throw new AppError("Please Login", 403);
      }
    }
  );

  public facebook = catchAsync(async (req: Request, res: Response) => {
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=894208924900180&redirect_uri=https://lottery-n73z.onrender.com/api/v1/auth/facebook/callback&config_id=358085403367931`;
    res.redirect(url);
  });

  public facebookCallBack = catchAsync(async (req: Request, res: Response) => {
    console.log("***********");
    const { code } = req.query;

    try {
      // Exchange authorization code for access token
      const { data } = await axios.get(
        `https://graph.facebook.com/v13.0/oauth/access_token?client_id=894208924900180&client_secret=63cc3b3d78c084c883246a32ff5b71a8&code=${code}&redirect_uri=https://lottery-n73z.onrender.com/api/v1/auth/facebook/callback`
      );

      const { access_token } = data;

      // Use access_token to fetch user profile
      const { data: profile } = await axios.get(
        `https://graph.facebook.com/v13.0/me?fields=id,name,email,first_name,last_name,gender,birthday&access_token=${access_token}`
      );

      console.log(profile);
      // Code to handle user authentication and retrieval using the profile data

      res.redirect("/");
    } catch (error: any) {
      console.error("Error:", error.response.data.error);
      res.redirect("/login");
    }
  });

  public verifyEmail = catchAsync(async (req: Request, res: Response) => {
    // Implementation for resetPassword
    // const exisitingUser = await User.findOne({
    //   email: req.query.email as string,
    // });

    // if (!exisitingUser) {
    //   throw new AppError("No user with this Email", 400);
    // }

    // if (req.params.id != exisitingUser.evt) {
    //   throw new AppError("Invalid token", 400);
    // }

    // if (exisitingUser.mtExpiresAt < new Date()) {
    //   throw new AppError("Token is Expired", 400);
    // }

    // exisitingUser.set({
    //   ismailVerified: true,
    //   evt: undefined,
    //   mtExpiresAt: undefined,
    // });

    // await exisitingUser.save();
    // this.sendEmailVerified(exisitingUser.email, {
    //   username: exisitingUser.username,
    // });
    await this.userService.verifyEmail(
      req.query.email as string,
      req.params.id
    );
    sendSuccess(res, 200, "email approved");
  });

  public resendEmailVerification = catchAsync(
    async (req: Request, res: Response) => {
      // Implementation for resetPassword
      // const exisitingUser = await User.findOne({
      //   email: req.query.email as string,
      // });

      // if (!exisitingUser) {
      //   throw new AppError("No user with this Email", 400);
      // }

      // const evt = this.generateToken();

      // exisitingUser.set({
      //   evt,
      //   mtExpiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
      // });
      // await exisitingUser.save();

      // this.sendEmailVerification(exisitingUser.email, {
      //   username: exisitingUser.fullName,
      //   link: `https://lottery-n73z.onrender.com/api/v1/auth/verify-mail/${evt}?email=${exisitingUser.email}`,
      //   token: evt,
      // });

      await this.userService.resendEmailVerificationMail(
        req.query.email as string
      );

      sendSuccess(res, 200, "Email sent");
    }
  );
  Twofa = catchAsync(async (req: Request, res: Response) => {
    // var secret = speakeasy.generateSecret({
    //   name: "Quizme",
    // });
    // await User.findByIdAndUpdate(req.currentUser!.id, {
    //   twofasecret: secret.base32,
    // });
    const twofa_url = await this.userService.Setup2fa(req.currentUser!.id);
    sendSuccess(res, 200, twofa_url);
  });

  VerifyTwofa = catchAsync(async (req: Request, res: Response) => {
    // const user = await User.findById(req.currentUser?.id);
    // const verified = speakeasy.totp.verify({
    //   secret: user!.twofasecret,
    //   encoding: "base32",
    //   token: req.body.token,
    // });

    // if (!verified) {
    //   throw new AppError("invalid token", 400);
    // }

    const tok= await this.userService.VerifyTwofaToken(
      req.currentUser!.id,
      req.body.token
    );

    sendSuccess(res, 200, tok);
  });

  GetToken = catchAsync(async (req: Request, res: Response) => {
    // const user = await User.findById(req.currentUser?.id);

    // if (!user || !user.twofasecret) {
    //   throw new AppError("User not found or 2FA secret missing", 400);
    // }

    // const token = speakeasy.totp({
    //   secret: user.twofasecret,
    //   encoding: "base32",
    // });

    const token = await this.userService.getToken(req.currentUser!.id);

    sendSuccess(res, 200, "Token generated", token);
  });
}
