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
  private fbSecret: string;
  private fbID: string;
  private fbRedirectUrl: string;

  constructor() {
    this.fbSecret = process.env.APP_SECRET!;
    this.fbID = process.env.APP_ID!;
    this.fbRedirectUrl = process.env.REDIRECT_URL!;
  }
  public login = catchAsync(async (req: Request, res: Response) => {
    // Implementation for login
    const { email, password } = req.body;

    const exisitingUser = await User.findOne({
      email,
    });

    if (!exisitingUser) {
      throw new AppError("No registered user with this email", 400);
    }

    const passwordCorrect = await Password.compare(
      exisitingUser.password,
      password
    );

    if (!passwordCorrect) {
      throw new AppError("incorrect password");
    }
    const user_data: UserPayload = {
      email: exisitingUser.email,
      id: exisitingUser.id,
      role: "user",
      image: exisitingUser.avatar,
    };

    const token = jwt.sign(user_data, process.env.JWT_KEY!);

    sendSuccess(res, 200, token);
  });

  public signup = catchAsync(async (req: Request, res: Response) => {
    // Implementation for signup
    let { fullName, username, email, password } = req.body;
    console.log(fullName, username, email, password);
    // const existingUser = await User.find({ $or: [{ username }, { email }] });
    // if (existingUser){
    //   throw new AppError("username or email already exist")
    // }

    let user = User.build({
      fullName,
      username,
      password,
      email,
    });

    user = await user.save();
    const jwt = signToken({
      id: user.id,
      email: user.email,
      role: "user",
    });

    sendSuccess(res, 201, {
      jwt,
    });
  });

  public existingUsername = catchAsync(async (req: Request, res: Response) => {
    // Implementation for forgotPassword
  });

  public existingEmail = catchAsync(async (req: Request, res: Response) => {
    // Implementation for forgotPassword
  });

  public forgotPassword = catchAsync(async (req: Request, res: Response) => {
    // Implementation for forgotPassword
  });

  public resetPassword = catchAsync(async (req: Request, res: Response) => {
    // Implementation for resetPassword
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
}
