import { Request, Response } from "express";
import { User } from "../models/user";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import { sendSuccess } from "../utils/response";
import axios from "axios";
import { Withdrawal } from "../models/withdrawalRequest";
import { Payment, PaymentDoc } from "../models/payment_details";
import { Transaction } from "../models/transaction";
import { Paystack } from "../utils/thirdParty/paystack";

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

  public RequestWithdrawal = catchAsync(async (req: Request, res: Response) => {
    const { amount, reference, source } = req.body;
    const user = await User.findById(req.currentUser!.id).populate("profile");
    if (!user) {
      throw new AppError("user not found", 400);
    }

    if (source == "referalBalance") {
      if (user.referalBalance < amount) {
        throw new AppError("insufficient funds", 400);
      }
    } else {
      if (user.walletBalance < amount) {
        throw new AppError("insufficient funds", 400);
      }
    }

    const withdraw_request = Withdrawal.build({
      amount,
      user: user.id,
      reference,
      source,
    });
    await withdraw_request.save();

    sendSuccess(res, 200, "withdrawal request made");
  });

  public ApproveRequest = catchAsync(async (req: Request, res: Response) => {
    const request = await Withdrawal.findById(req.params.id);
    if (!request) {
      throw new AppError("request not found", 400);
    }

    if (request.status == "APPROVED") {
      throw new AppError("sorry, this request has previously been approved");
    }

    const user = await User.findById(request.user).populate("profile");

    console.log("USERID:", String(request.user), "USER DETAILS:", user);

    if (!user?.profile) {
      throw new AppError("user profile has not been set to do this", 400);
    }

    const profile = user.profile as PaymentDoc;
    if (request.source == "referalBalance") {
      if (user.referalBalance < request.amount) {
        throw new AppError("insufficient funds", 400);
      }
    } else {
      if (user.walletBalance < request.amount) {
        throw new AppError("insufficient funds", 400);
      }
    }

    const paystack = new Paystack();
    let recipient_code = profile.paystackAccountId;
    if (!recipient_code) {
      await paystack
        .createTransferRecipient({
          type: "nuban",
          name: user.fullName,
          account_number: profile.accountNumber,
          bank_code: profile.bankCode,
          currency: "NGN",
        })
        .then(async (res) => {
          await Payment.findByIdAndUpdate(profile.id, {
            paystackAccountId: res.data.recipient_code,
          });
          recipient_code = res.data.recipient_code;
        });
    }

    await paystack.transferMoney({
      recipient: recipient_code!,
      amount: String(request.amount * 100),
      source: "balance",
      reason: `cashout from ${request.source}`,
    });

    const transaction = Transaction.build({
      user: request.user as string,
      description: `withdrawal from ${request.source}`,
      type: "DR",
      reference: request.reference,
      status: "SUCCESSFUL",
      amount: request.amount,
    });
    await transaction.save();
    request.set({
      status: "APPROVED",
      approvedBy: req.currentUser?.id,
      approvedAt: new Date().toDateString,
    });
    await request.save();

    sendSuccess(res, 200, "approved");
  });

  public DisApproveRequest = catchAsync(async (req: Request, res: Response) => {
    const request = await Withdrawal.findById(req.params.id);
    if (!request) {
      throw new AppError("request not found", 400);
    }

    if (request.status == "APPROVED" || request.status == "DISAPPROVED") {
      throw new AppError(
        "sorry, this request has previously been approved or disapproved"
      );
    }
    request.set({
      status: "DISAPPROVED",
    });
    await request.save();
    sendSuccess(res, 200, "request disapproved");
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

  public GetAllRequests = catchAsync(async (req: Request, res: Response) => {
    const request = await Withdrawal.find().populate("user");
    sendSuccess(res, 200, request);
  });

  public GetAllRequest = catchAsync(async (req: Request, res: Response) => {
    const request = await Withdrawal.findById(req.params.id).populate("user");
    sendSuccess(res, 200, request);
  });

  public GetUserWithdrawlRequest = catchAsync(
    async (req: Request, res: Response) => {
      const request = await Withdrawal.findOne({ user: req.params.id });
      sendSuccess(res, 200, request);
    }
  );
}
