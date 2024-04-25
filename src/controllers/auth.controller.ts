import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import jwt from "jsonwebtoken";
import { UserPayload } from "../utils/validators";
import { User } from "../models/user";
import { Password } from "../utils/Password";
import { sendSuccess } from "../utils/response";
import { catchAsync } from "../utils/catchAsync";
import axios from "axios";

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

    const token = jwt.sign(user_data, process.env.JWTKEY!);

    sendSuccess(res, 200, token);
  });

  public signup = catchAsync(async (req: Request, res: Response) => {
    // Implementation for signup
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
        `https://graph.facebook.com/v13.0/oauth/access_token?client_id=894208924900180&client_secret=63cc3b3d78c084c883246a32ff5b71a8&code=${code}&redirect_uri=https://quizmeapp.io/`
      );

      const { access_token } = data;

      // Use access_token to fetch user profile
      const { data: profile } = await axios.get(
        `https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`
      );

      // Code to handle user authentication and retrieval using the profile data

      res.redirect("/");
    } catch (error: any) {
      console.error("Error:", error.response.data.error);
      res.redirect("/login");
    }
  });
}
