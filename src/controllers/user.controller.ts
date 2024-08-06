import { Request, Response } from "express";
import { User } from "../models/user";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import { sendSuccess } from "../utils/response";
import axios from "axios";

export class UserController {
  public addInterest = catchAsync(async (req: Request, res: Response) => {
    let interest = req.body.interest as string[];

    const user = await User.findById(req.currentUser?.id);
    if (!user) {
      throw new AppError("user not found", 400);
    }

    user.set({
      interests: interest.concat(user!.interest),
    });

    await user?.save();
    sendSuccess(res, 200, user);
  });

  public myProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser?.id).populate("profile");
    if (!user) {
      throw new AppError("user not found", 400);
    }
    sendSuccess(res, 200, user);
  });

  public GetUserCompleteDetails = catchAsync(
    async (req: Request, res: Response) => {
      const user = await User.findById(req.currentUser?.id).populate("profile");
      if (!user) {
        throw new AppError("user not found", 400);
      }
      sendSuccess(res, 200, user);
    }
  );

  public updateProfile = catchAsync(async (req: Request, res: Response) => {
    delete req.body.walletBalance;
    const user = await User.findByIdAndUpdate(req.currentUser?.id, {
      ...req.body,
    });

    sendSuccess(res, 200, user);
  });

  public uploadFile = catchAsync(async (req: Request, res: Response) => {
    sendSuccess(res, 200, { ...req.body });
  });

  // https://api.paystack.co/bank

  public listOfBanks = catchAsync(async (req: Request, res: Response) => {
    const url = "https://api.paystack.co/bank";
    const banks = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
      },
    });

    sendSuccess(res, 200, banks.data.data);
  });

  public BlockUser = catchAsync(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isBlocked: true,
    });

    if (!user) {
      throw new AppError("no existing user with this Id", 400);
    }

    sendSuccess(res, 200, "user blocked successfully");
  });

  public UnBlockUser = catchAsync(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isBlocked: false,
    });

    if (!user) {
      throw new AppError("no existing user with this Id", 400);
    }

    sendSuccess(res, 200, "user unblockedblocked successfully");
  });

  public GetUserFullDetails = catchAsync(
    async (req: Request, res: Response) => {
      const user = await User.findById(req.params.id)
        .populate("referrals")
        .populate("refereeId")
        .populate("profile")
        .populate("games");
      // .populate("transactions");

      if (!user) {
        throw new AppError("no existing user with this Id", 400);
      }

      sendSuccess(res, 200, user);
    }
  );

  public GetAllUsers = catchAsync(async (req: Request, res: Response) => {
    const user = await User.find().populate("profile");

    if (!user) {
      throw new AppError("no existing user with this Id", 400);
    }

    sendSuccess(res, 200, user);
  });
}
