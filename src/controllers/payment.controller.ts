import { Request, Response } from "express";
import { Payment } from "../models/payment_details";
import { sendSuccess } from "../shared/utils/response";
import { catchAsync } from "../shared/utils/catchAsync";
import { Paystack } from "../shared/utils/thirdParty/paystack";
import { User } from "../models/user";

export class PaymentController extends Paystack {
  public setUpUserPaymentDetails = catchAsync(
    async (req: Request, res: Response) => {
      const { accountName, accountNumber, bankCode, userId } = req.body;

      const payStackAuth = await this.createTransferRecipient({
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      });

      const user = Payment.build({
        accountName,
        accountNumber,
        bankCode,
        user: userId,
        paystackAccountId: payStackAuth.data.recipient_code,
      });

      await user.save();

      await User.findByIdAndUpdate(req.currentUser?.id, {
        profile: user.id,
      });

      sendSuccess(res, 200, "details saved successfully");
    }
  );

  public NameEnquiry_ = catchAsync(async (req: Request, res: Response) => {
    const data = await this.NameEnquiry({
      ...req.body,
    });

    sendSuccess(res, 200, data.data);
  });

  public UpdateUserPaymentDetails = catchAsync(
    async (req: Request, res: Response) => {
      const { accountName, accountNumber, bankCode, userId } = req.body;

      const payStackAuth = await this.createTransferRecipient({
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      });

      const profile = await Payment.findOneAndUpdate(
        {
          user: userId,
        },
        {
          accountName,
          accountNumber,
          bankCode,
          paystackAccountId: payStackAuth.data.recipient_code,
        }
      );

      await User.findOneAndUpdate(userId, {
        profile: profile!.id,
      });

      sendSuccess(res, 200, "details updated successfully");
    }
  );

  public withdrawCash = catchAsync(async (req: Request, res: Response) => {
    if (req.query.type === "account") {
      // Implement Paystack
    } else {
      // Implement Paypal
    }
  });

  public WebHook = catchAsync(async (req: Request, res: Response) => {
    switch (req.body.event) {
      case "transfer.success":
        console.log(
          req.body.data.reference,
          "===================================="
        );
        break;

      default:
        break;
    }
  });
}

// {
//   "event": "charge.success",
//   "data": {
//     "id": 302961,
//     "domain": "live",
//     "status": "success",
//     "reference": "qTPrJoy9Bx",
//     "amount": 10000,
//     "message": null,
//     "gateway_response": "Approved by Financial Institution",
//     "paid_at": "2016-09-30T21:10:19.000Z",
//     "created_at": "2016-09-30T21:09:56.000Z",
//     "channel": "card",
//     "currency": "NGN",
//     "ip_address": "41.242.49.37",
//     "metadata": 0,
//     "log": {
//       "time_spent": 16,
//       "attempts": 1,
//       "authentication": "pin",
//       "errors": 0,
//       "success": false,
//       "mobile": false,
//       "input": [],
//       "channel": null,
//       "history": [
//         {
//           "type": "input",
//           "message": "Filled these fields: card number, card expiry, card cvv",
//           "time": 15
//         },
//         {
//           "type": "action",
//           "message": "Attempted to pay",
//           "time": 15
//         },
//         {
//           "type": "auth",
//           "message": "Authentication Required: pin",
//           "time": 16
//         }
//       ]
//     },
//     "fees": null,
//     "customer": {
//       "id": 68324,
//       "first_name": "BoJack",
//       "last_name": "Horseman",
//       "email": "bojack@horseman.com",
//       "customer_code": "CUS_qo38as2hpsgk2r0",
//       "phone": null,
//       "metadata": null,
//       "risk_action": "default"
//     },
//     "authorization": {
//       "authorization_code": "AUTH_f5rnfq9p",
//       "bin": "539999",
//       "last4": "8877",
//       "exp_month": "08",
//       "exp_year": "2020",
//       "card_type": "mastercard DEBIT",
//       "bank": "Guaranty Trust Bank",
//       "country_code": "NG",
//       "brand": "mastercard",
//       "account_name": "BoJack Horseman"
//     },
//     "plan": {}
//   }
// }
