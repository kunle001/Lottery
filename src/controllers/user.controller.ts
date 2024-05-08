import { Request, Response } from "express";
import { User } from "../models/user";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import { sendSuccess } from "../utils/response";

export class UserController {
  public addInterest = catchAsync(async (req: Request, res: Response) => {
    let interest = req.body.interest as string[];

    const user = await User.findById(req.currentUser?.id);
    if (!user) {
      throw new AppError("user not found", 400);
    }

    user.set({
      interest: interest.concat(user!.interest),
    });

    await user?.save();
    sendSuccess(res, 200, user);
  });
}
