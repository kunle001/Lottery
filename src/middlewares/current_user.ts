import { JWT_KEY } from "../config";
import AppError from "../shared/utils/appError";
import { catchAsync } from "../shared/utils/catchAsync";
import { UserPayload } from "../shared/utils/validators";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const currentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return next();
    }

    const isAuthenticated = jwt.verify(
      req.headers.authorization,
      JWT_KEY
    ) as UserPayload;
    if (!isAuthenticated) {
      throw new AppError("session expired", 401);
    }

    req.currentUser = isAuthenticated;

    next();
  }
);

export const RestrictAccessto = (roles: string[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.currentUser!.role)) {
      throw new AppError("restricted access", 403);
    }

    next();
  });

export const requireAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      throw new AppError("user is required to login", 403);
    }
    next();
  }
);
