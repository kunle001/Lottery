import { PaymentDoc } from "../models/payment_details";
import { PlayerDoc } from "../models/players";
import { UserDoc } from "../models/user";
import { EWithdrawalSource, WithdrawalDoc } from "../models/withdrawalRequest";
import { IPlayerRepo } from "../repositories/game-players/IPlayer";
import { INotificationRepository } from "../repositories/notification/INotification";
import { IPaymentRepository } from "../repositories/payment/IPayment";
import { ITransactionRepository } from "../repositories/transaction/ITransaction";
import { IUpdateUser, IUserRepository } from "../repositories/user/IUser";
import { UserRepository } from "../repositories/user/userRepository";
import { IWithdrawalRepository } from "../repositories/withdrawal/IWithdrawal";
import { IThirdPartyPayment } from "../shared/interfaces/payment";
import AppError from "../shared/utils/appError";
import { Paystack } from "../shared/utils/thirdParty/paystack";

interface IrequestWithdrawal {
  amount: number;
  reference: string;
  source: EWithdrawalSource;
}

export class UserService {
  private userRepository: IUserRepository;
  private playerRepository: IPlayerRepo;
  private withdrawalRepository: IWithdrawalRepository;
  private paymentRepository: IPaymentRepository;
  private transactionRepository: ITransactionRepository;
  private notificationRepo: INotificationRepository;
  private thirdPartyPaymentService: IThirdPartyPayment;

  constructor(
    repo: UserRepository,
    playerRepo_: IPlayerRepo,
    withdrwaRepo_: IWithdrawalRepository,
    paymentRepo_: IPaymentRepository,
    transactionRepo_: ITransactionRepository,
    notificationRepo_: INotificationRepository,
    thirdPartyPayment_: IThirdPartyPayment
  ) {
    this.userRepository = repo;
    this.playerRepository = playerRepo_;
    this.withdrawalRepository = withdrwaRepo_;
    this.transactionRepository = transactionRepo_;
    this.paymentRepository = paymentRepo_;
    this.notificationRepo = notificationRepo_;
    this.thirdPartyPaymentService = thirdPartyPayment_;
  }

  async addInterest(
    interests: string[],
    userId: string
  ): Promise<UserDoc | null> {
    const exisitingUser = await this.userRepository.findById(userId);

    if (!exisitingUser) {
      throw new AppError("user not found", 400);
    }

    const updateUser = await this.userRepository.update(userId, {
      interests,
    });
    return updateUser;
  }

  async myProfile(id: string): Promise<UserDoc | null> {
    const user = await this.userRepository.findById(id, [
      {
        fieldName: "referrals",
        fieldSubFields: ["email", "fullName"],
      },
    ]);

    if (!user) {
      throw new AppError("user not found", 400);
    }
    return user;
  }

  async myChances(userId: string): Promise<PlayerDoc | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const playa_query = {
      user: userId,
      started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
    };
    const player = await this.playerRepository.findOne(playa_query);

    return player;
  }

  async getUserCompleteDetails(userId: string): Promise<UserDoc | null> {
    const user = await this.userRepository.findById(userId, [
      {
        fieldName: "profile",
      },
    ]);
    if (!user) {
      throw new AppError("user not found", 400);
    }
    return user;
  }

  async updateProfile(
    userId: string,
    data: IUpdateUser
  ): Promise<UserDoc | null> {
    const user = await this.userRepository.update(userId, data);
    return user;
  }

  async requestWithdrawal(userId: string, data: IrequestWithdrawal) {
    const { amount, reference, source } = data;
    const user = await this.userRepository.findById(userId, [
      { fieldName: "profile" },
    ]);

    if (!user) {
      throw new AppError("user not found", 400);
    }

    if (source === EWithdrawalSource.referalBalance) {
      if (user.referalBalance < amount) {
        throw new AppError("insufficient funds", 400);
      }
    } else {
      if (user.walletBalance < amount) {
        throw new AppError("insufficient funds", 400);
      }
    }

    const withdraw_request = this.withdrawalRepository.create({
      amount,
      user: user.id,
      reference,
      source,
    });

    return withdraw_request;
  }

  async approveWithdrawalRequest(withdrawalId: string, approverId: string) {
    const request = await this.withdrawalRepository.findById(withdrawalId);
    if (!request) {
      throw new AppError("request not found", 400);
    }

    if (request.status == "APPROVED") {
      throw new AppError("this request has previously been approved");
    }

    const user = await this.userRepository.findById(request.user as string, [
      {
        fieldName: "profile",
      },
    ]);

    console.log("USERID:", String(request.user), "USER DETAILS:", user);

    if (!user?.profile) {
      throw new AppError("user profile has not been set to do this", 400);
    }

    const profile = user.profile as PaymentDoc;
    if (request.source == EWithdrawalSource.referalBalance) {
      if (user.referalBalance < request.amount) {
        throw new AppError("insufficient funds", 400);
      }
    } else {
      if (user.walletBalance < request.amount) {
        throw new AppError("insufficient funds", 400);
      }
    }

    let recipient_code = profile.paystackAccountId;
    if (!recipient_code) {
      await this.thirdPartyPaymentService
        .createTransferRecipient({
          type: "nuban",
          name: user.fullName,
          account_number: profile.accountNumber,
          bank_code: profile.bankCode,
          currency: "NGN",
        })
        .then(async (res) => {
          await this.paymentRepository.update(profile.id, {
            paystackAccountId: res.data.recipient_code,
          });
          recipient_code = res.data.recipient_code;
        });
    }

    await this.thirdPartyPaymentService.transferMoney({
      recipient: recipient_code!,
      amount: String(request.amount * 100),
      source: "balance",
      reason: `QUIZ ME wallet cashout from ${request.source}`,
    });

    await this.transactionRepository.create({
      user: request.user as string,
      description: `withdrawal from ${request.source}`,
      type: "DR",
      reference: request.reference,
      status: "SUCCESSFUL",
      amount: -request.amount,
    });

    await this.withdrawalRepository.update(request.id, {
      status: "APPROVED",
      approvedBy: approverId,
      approvedAt: new Date().toDateString(),
    });
    await request.save();

    // update wallet balance
    if (request.source == EWithdrawalSource.referalBalance) {
      await this.userRepository.update(user.id, {
        referalBalance: user.referalBalance - request.amount,
      });
    }

    await this.notificationRepo.create({
      user: user?.id,
      message: "your withdrawal request has been approved",
      isBad: false,
    });
  }

  async disapproveRequest(withdrawalId: string) {
    const request = await this.withdrawalRepository.findById(withdrawalId);
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

    await this.notificationRepo.create({
      user: request.user as string,
      message: "your request has been disapproved",
      isBad: true,
    });
  }

  async blockUser(userId: string) {
    const user = await this.userRepository.update(userId, {
      isBlocked: true,
    });

    if (!user) {
      throw new AppError("no existing user with this Id", 400);
    }
  }

  async unblockUser(userId: string) {
    const user = await this.userRepository.update(userId, {
      isBlocked: false,
    });

    if (!user) {
      throw new AppError("no existing user with this Id", 400);
    }
  }

  async getUserFullDetails(userId: string): Promise<UserDoc> {
    const user = await this.userRepository.findById(userId, [
      {
        fieldName: "referrals",
      },
      { fieldName: "refereeId" },
      { fieldName: "profile" },
      { fieldName: "games" },
      { fieldName: "withdrawal_requests" },
      { fieldName: "transactions" },
    ]);

    if (!user) {
      throw new AppError("no existing user with this Id", 400);
    }
    return user;
  }

  async getAllUsers(page?: number, pageSize?: number): Promise<UserDoc[]> {
    const users = await this.userRepository.findAll(page, pageSize, [
      {
        fieldName: "profile",
      },
    ]);

    return users;
  }

  async getAllWithdrawalRequests(
    page?: number,
    pageSize?: number
  ): Promise<WithdrawalDoc[]> {
    const withdrawals = await this.withdrawalRepository.findAll(page, pageSize);

    return withdrawals;
  }

  async getWithdrawalRequest(withdrawalId: string): Promise<WithdrawalDoc> {
    const withdrawal = await this.withdrawalRepository.findById(withdrawalId, [
      {
        fieldName: "user",
      },
    ]);
    if (!withdrawal) {
      throw new AppError("withdrawal with this Id not found", 400);
    }
    return withdrawal;
  }

  async getUserWithdrawalRequest(userId: string): Promise<WithdrawalDoc[]> {
    const withdrawal = await this.withdrawalRepository.findMany({
      user: userId,
    });
    if (!withdrawal) {
      throw new AppError("user withdrawals not found", 400);
    }
    return withdrawal;
  }

  async DeleteUser(email: string) {
    await this.userRepository.delete({ email });
  }
}
