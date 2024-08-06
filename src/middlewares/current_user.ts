import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { UserPayload } from "../utils/validators";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const currentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return next();
    }

    const isAuthenticated = jwt.verify(
      req.headers.authorization,
      process.env.JWT_KEY!
    ) as UserPayload;

    req.currentUser = isAuthenticated;

    next();
  }
);

export const RestrictAccessto = (roles: string[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.currentUser!.role)) {
      throw new AppError("this user cannot access this");
    }

    next();
  });

export const requireAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      throw new AppError("Please Login", 403);
    }
    next();
  }
);
