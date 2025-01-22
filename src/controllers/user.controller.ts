import { Request, Response } from "express";
import { User } from "../models/user";
import { catchAsync } from "../shared/utils/catchAsync";
import AppError from "../shared/utils/appError";
import { sendSuccess } from "../shared/utils/response";
import axios from "axios";
import { Withdrawal } from "../models/withdrawalRequest";
import { Payment, PaymentDoc } from "../models/payment_details";
import { Transaction } from "../models/transaction";
import { Paystack } from "../shared/utils/thirdParty/paystack";
import { Player } from "../models/players";
import { Notification } from "../models/notification";
import { Request as QuestionRequest } from "../models/requests";
import mongoose from "mongoose";
import { MAXIMUM_CHANCES } from "../config";
import { UserRepository } from "../repositories/user/userRepository";
import { UserService } from "../services/userService";
import { PlayerRepo } from "../repositories/game-players/playerRepo";
import { WithdrawalRepo } from "../repositories/withdrawal/withdrawalRepository";
import { PaymentRepo } from "../repositories/payment/paymentRepo";
import { TransactionRepo } from "../repositories/transaction/transactionRepo";
import { NotificationRepo } from "../repositories/notification/notificationRepo";

export class UserController {
  private userService: UserService;

  constructor() {
    const userRepo = new UserRepository(User);
    const playerRepo = new PlayerRepo(Player);
    const withdrawalRepo = new WithdrawalRepo(Withdrawal);
    const paymentRepo = new PaymentRepo(Payment);
    const transactionRepo = new TransactionRepo(Transaction);
    const notificationRepo = new NotificationRepo(Notification);
    const paymentService = new Paystack();
    this.userService = new UserService(
      userRepo,
      playerRepo,
      withdrawalRepo,
      paymentRepo,
      transactionRepo,
      notificationRepo,
      paymentService
    );
  }
  public addInterest = catchAsync(async (req: Request, res: Response) => {
    let interest = req.body.interest as string[];

    const user = await this.userService.addInterest(
      interest,
      req.currentUser!.id
    );
    sendSuccess(res, 200, user);
  });

  public myProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.myProfile(req.currentUser!.id);
    sendSuccess(res, 200, user);
  });

  public MyChances = catchAsync(async (req: Request, res: Response) => {
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const player = await Player.findOne({
    //   user: req.currentUser?.id,
    //   started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
    // });

    const player = await this.userService.myChances(req.currentUser!.id);
    sendSuccess(res, 200, {
      chances: player ? player.chances : MAXIMUM_CHANCES,
    });
  });

  public GetUserCompleteDetails = catchAsync(
    async (req: Request, res: Response) => {
      const user = await this.userService.getUserCompleteDetails(
        req.currentUser!.id
      );
      sendSuccess(res, 200, user);
    }
  );

  public updateProfile = catchAsync(async (req: Request, res: Response) => {
    delete req.body.walletBalance;
    const user = await this.userService.updateProfile(req.currentUser!.id, {
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
    // const user = await User.findById(req.currentUser!.id).populate("profile");

    // if (!user) {
    //   throw new AppError("user not found", 400);
    // }

    // if (source == "referalBalance") {
    //   if (user.referalBalance < amount) {
    //     throw new AppError("insufficient funds", 400);
    //   }
    // } else {
    //   // cheking wallet balance
    //   const result = await Transaction.aggregate([
    //     {
    //       $match: {
    //         user: new mongoose.Types.ObjectId(req.currentUser?.id),
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: null,
    //         balance: { $sum: "$amount" },
    //       },
    //     },
    //   ]);

    //   const balance = result[0]?.balance || 0;
    //   if (balance < amount) {
    //     throw new AppError("insufficient funds", 400);
    //   }
    // }

    // const withdraw_request = Withdrawal.build({
    //   amount,
    //   user: user.id,
    //   reference,
    //   source,
    // });
    // await withdraw_request.save();

    await this.userService.requestWithdrawal(req.currentUser!.id, {
      amount,
      reference,
      source,
    });

    sendSuccess(res, 200, "withdrawal request made");
  });

  public ApproveRequest = catchAsync(async (req: Request, res: Response) => {
    // const request = await Withdrawal.findById(req.params.id);
    // if (!request) {
    //   throw new AppError("request not found", 400);
    // }

    // if (request.status == "APPROVED") {
    //   throw new AppError("sorry, this request has previously been approved");
    // }

    // const user = await User.findById(request.user).populate("profile");

    // console.log("USERID:", String(request.user), "USER DETAILS:", user);

    // if (!user?.profile) {
    //   throw new AppError("user profile has not been set to do this", 400);
    // }

    // const profile = user.profile as PaymentDoc;
    // if (request.source == "referalBalance") {
    //   if (user.referalBalance < request.amount) {
    //     throw new AppError("insufficient funds", 400);
    //   }
    // } else {
    //   if (user.walletBalance < request.amount) {
    //     throw new AppError("insufficient funds", 400);
    //   }
    // }

    // const paystack = new Paystack();
    // let recipient_code = profile.paystackAccountId;
    // if (!recipient_code) {
    //   await paystack
    //     .createTransferRecipient({
    //       type: "nuban",
    //       name: user.fullName,
    //       account_number: profile.accountNumber,
    //       bank_code: profile.bankCode,
    //       currency: "NGN",
    //     })
    //     .then(async (res) => {
    //       await Payment.findByIdAndUpdate(profile.id, {
    //         paystackAccountId: res.data.recipient_code,
    //       });
    //       recipient_code = res.data.recipient_code;
    //     });
    // }

    // await paystack.transferMoney({
    //   recipient: recipient_code!,
    //   amount: String(request.amount * 100),
    //   source: "balance",
    //   reason: `QUIZ ME wallet cashout from ${request.source}`,
    // });

    // const transaction = Transaction.build({
    //   user: request.user as string,
    //   description: `withdrawal from ${request.source}`,
    //   type: "DR",
    //   reference: request.reference,
    //   status: "SUCCESSFUL",
    //   amount: -request.amount,
    // });
    // await transaction.save();
    // request.set({
    //   status: "APPROVED",
    //   approvedBy: req.currentUser?.id,
    //   approvedAt: new Date().toDateString,
    // });
    // await request.save();

    // // update wallet balance
    // request.source == "referalBalance"
    //   ? user.set({
    //       referalBalance: user.referalBalance - request.amount,
    //     })
    //   : user.set({
    //       walletBalance: user.walletBalance - request.amount,
    //     });
    // // save user details
    // await user.save();

    // const notificaton = Notification.build({
    //   user: user?.id,
    //   message: "your request has been approved",
    //   isBad: false,
    // });
    // await notificaton.save();
    await this.userService.approveWithdrawalRequest(
      req.params.id,
      req.currentUser!.id
    );
    sendSuccess(res, 200, "approved");
  });

  public DisApproveRequest = catchAsync(async (req: Request, res: Response) => {
    // const request = await Withdrawal.findById(req.params.id);
    // if (!request) {
    //   throw new AppError("request not found", 400);
    // }

    // if (request.status == "APPROVED" || request.status == "DISAPPROVED") {
    //   throw new AppError(
    //     "sorry, this request has previously been approved or disapproved"
    //   );
    // }
    // request.set({
    //   status: "DISAPPROVED",
    // });
    // await request.save();

    // const notificaton = Notification.build({
    //   user: request.user as string,
    //   message: "your request has been disapproved",
    //   isBad: true,
    // });
    // await notificaton.save();
    await this.userService.disapproveRequest(req.params.id);
    sendSuccess(res, 200, "request disapproved");
  });

  public BlockUser = catchAsync(async (req: Request, res: Response) => {
    // const user = await User.findByIdAndUpdate(req.params.id, {
    //   isBlocked: true,
    // });

    // if (!user) {
    //   throw new AppError("no existing user with this Id", 400);
    // }
    await this.userService.blockUser(req.params.id);
    sendSuccess(res, 200, "user blocked successfully");
  });

  public UnBlockUser = catchAsync(async (req: Request, res: Response) => {
    // const user = await User.findByIdAndUpdate(req.params.id, {
    //   isBlocked: false,
    // });

    // if (!user) {
    //   throw new AppError("no existing user with this Id", 400);
    // }
    await this.userService.unblockUser(req.params.id);
    sendSuccess(res, 200, "user unblockedblocked successfully");
  });

  public GetUserFullDetails = catchAsync(
    async (req: Request, res: Response) => {
      // const user = await User.findById(req.params.id)
      //   .populate("referrals")
      //   .populate("refereeId")
      //   .populate("profile")
      //   .populate("games")
      //   .populate("withdrawal_requests")
      //   .populate("transactions");

      // if (!user) {
      //   throw new AppError("no existing user with this Id", 400);
      // }
      const user = await this.userService.getUserFullDetails(req.params.id);
      sendSuccess(res, 200, user);
    }
  );

  public GetAllUsers = catchAsync(async (req: Request, res: Response) => {
    // const user = await User.find().populate("profile");

    // if (!user) {
    //   throw new AppError("no existing user with this Id", 400);
    // }
    const { page, pageSize } = req.query;
    const user = await this.userService.getAllUsers(
      Number(page) || 1,
      Number(pageSize) || 50
    );

    sendSuccess(res, 200, user);
  });

  public GetAllRequests = catchAsync(async (req: Request, res: Response) => {
    const { page, pageSize } = req.query;
    const request = await this.userService.getAllWithdrawalRequests(
      Number(page) | 1,
      Number(pageSize) | 50
    );
    sendSuccess(res, 200, request);
  });

  public GetAllRequest = catchAsync(async (req: Request, res: Response) => {
    const request = await this.userService.getWithdrawalRequest(req.params.id);
    sendSuccess(res, 200, request);
  });

  public GetUserWithdrawlRequest = catchAsync(
    async (req: Request, res: Response) => {
      // const request = await Withdrawal.find({ user: req.params.id });
      const request = await this.userService.getUserWithdrawalRequest(
        req.params.id
      );
      sendSuccess(res, 200, request);
    }
  );

  public GetAccountBalance = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.getUserFullDetails(req.currentUser!.id);

    sendSuccess(res, 200, { balance: user.walletBalance });
  });

  public RequestQuestionCreation = catchAsync(
    async (req: Request, res: Response) => {
      const { age, sex, interest } = req.body;
      const request = QuestionRequest.build({
        user: req.currentUser!.id,
        age,
        sex,
        interest,
      });
      await request.save();
      sendSuccess(res, 200, request);
    }
  );

  public DeleteUser = catchAsync(async (req: Request, res: Response) => {
    const request = await this.userService.DeleteUser(
      req.query.email as string
    );

    sendSuccess(res, 200, request);
  });

  public WebHook = catchAsync(async (req: Request, res: Response) => {
    console.log("===========+Recieved Webhook =============", 
      req.body,
       "=======================")
    
    sendSuccess(res, 200, "received");
  });
}
