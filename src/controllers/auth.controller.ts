import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import jwt from "jsonwebtoken";
import { UserPayload, signToken } from "../utils/validators";
import { User } from "../models/user";
import { Password } from "../utils/Password";
import { sendSuccess } from "../utils/response";
import { catchAsync } from "../utils/catchAsync";
import axios from "axios";
import dotenv from "dotenv";
import { SendEmail } from "../utils/email";

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

export class AuthController extends SendEmail {
  private fbSecret: string;
  private fbID: string;
  private fbRedirectUrl: string;

  constructor() {
    super();
    this.fbSecret = process.env.APP_SECRET!;
    this.fbID = process.env.APP_ID!;
    this.fbRedirectUrl = process.env.REDIRECT_URL!;
  }

  private generateToken(): string {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    return token;
  }
  public login = catchAsync(async (req: Request, res: Response) => {
    // Implementation for login
    const { email, password } = req.body;

    const exisitingUser = await User.findOne({
      email,
    }).populate("referrals");

    if (!exisitingUser) {
      throw new AppError("No registered user with this email", 400);
    }

    const passwordCorrect = await Password.compare(
      exisitingUser.password,
      password
    );

    if (!passwordCorrect) {
      throw new AppError("incorrect password", 400);
    }

    if (!exisitingUser.ismailVerified) {
      throw new AppError("cannot login your email is not verified", 400);
    }
    const user_data = {
      role: "user",
      image: exisitingUser.avatar,
      id: exisitingUser.id,
      ...exisitingUser,
    };

    const token = jwt.sign(user_data, process.env.JWT_KEY!);

    sendSuccess(res, 200, {
      token,
      user_data: exisitingUser,
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
    } = req.body;
    // const existingUser = await User.find({ $or: [{ username }, { email }] });
    // if (existingUser) {
    //   throw new AppError("username or email already exist");
    // }
    const evt = this.generateToken();

    // check device
    const deviceId = req.body.deviceId;
    if (!deviceId) {
      throw new AppError("deviceId id required", 500);
    }

    let user = User.build({
      fullName,
      username,
      password,
      email,
      zipCode,
      address,
      phoneNumber,
      country,
      evt,
      mtExpiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
      deviceId,
    });

    const user_device = await User.find({
      deviceId,
    });

    //  check referalCode
    let referalCode = req.body.referalCode;
    if (referalCode) {
      const referee = await User.findOne({
        referalCode,
      });

      if (!referee) {
        throw new AppError("invalid referal code", 400);
      }
      user.refereeId = referee?.id;
      // check if device has not registered more than 3 or 3 accounts, then reward the account
      if (user_device && user_device.length! >= 3) {
        referee.referalBalance += 50;
        await referee.save();
      }
    }

    user = await user.save();
    const jwt = signToken({
      id: user.id,
      email: user.email,
      role: "user",
    });

    this.sendEmailVerification(user.email, {
      link: `https://lottery-n73z.onrender.com/api/v1/auth/verify-mail/${evt}?email=${email}`,
      username: username,
      token: evt,
    });

    sendSuccess(res, 201, {
      jwt,
      user,
    });
  });

  public existingUsername = catchAsync(async (req: Request, res: Response) => {
    const existingUser = req.query.username
      ? await User.findOne({
          username: req.query.username as string,
        })
      : await User.findOne({
          email: req.query.email as string,
        });

    sendSuccess(res, 200, {
      userExists: existingUser ? true : false,
    });
  });

  public existingEmail = catchAsync(async (req: Request, res: Response) => {
    // Implementation for forgotPassword
  });

  public forgotPassword = catchAsync(async (req: Request, res: Response) => {
    // Implementation for forgotPassword
    const exisitingUser = await User.findOne({
      email: req.body.email,
    });

    if (!exisitingUser) {
      throw new AppError("No user with this Email", 400);
    }

    const token = this.generateToken();

    exisitingUser.set({
      prt: token,
      tokenExpiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    });
    await exisitingUser.save();
    this.sendToken(exisitingUser.email, {
      username: exisitingUser.username,
      token,
    });

    sendSuccess(res, 200, "Token sent");
  });

  public resetPassword = catchAsync(async (req: Request, res: Response) => {
    // Implementation for resetPassword
    const { email, token, password } = req.body;
    const exisitingUser = await User.findOne({
      email: req.body.email,
    });

    if (!exisitingUser) {
      throw new AppError("No user with this Email", 400);
    }

    if (token != exisitingUser.prt) {
      throw new AppError("Invalid token", 400);
    }

    if (exisitingUser.tokenExpiresAt < new Date()) {
      throw new AppError("token is Expired", 400);
    }

    exisitingUser.set({
      password,
      prt: undefined,
      tokenExpiresAt: undefined,
    });

    await exisitingUser.save();
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
    const exisitingUser = await User.findOne({
      email: req.query.email as string,
    });

    if (!exisitingUser) {
      throw new AppError("No user with this Email", 400);
    }

    if (req.params.id != exisitingUser.evt) {
      throw new AppError("Invalid token", 400);
    }

    if (exisitingUser.mtExpiresAt < new Date()) {
      throw new AppError("Token is Expired", 400);
    }

    exisitingUser.set({
      ismailVerified: true,
      evt: undefined,
      mtExpiresAt: undefined,
    });

    await exisitingUser.save();
    this.sendEmailVerified(exisitingUser.email, {
      username: exisitingUser.username,
    });
    sendSuccess(res, 200, "email approved");
  });

  public resendEmailVerification = catchAsync(
    async (req: Request, res: Response) => {
      // Implementation for resetPassword
      const exisitingUser = await User.findOne({
        email: req.query.email as string,
      });

      if (!exisitingUser) {
        throw new AppError("No user with this Email", 400);
      }

      const evt = this.generateToken();

      exisitingUser.set({
        evt,
        mtExpiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
      });
      await exisitingUser.save();

      this.sendEmailVerification(exisitingUser.email, {
        username: exisitingUser.fullName,
        link: `https://lottery-n73z.onrender.com/api/v1/auth/verify-mail/${evt}?email=${exisitingUser.email}`,
        token: evt,
      });

      sendSuccess(res, 200, "Email sent");
    }
  );
}
