import { Request, Response } from "express";
import { Payment } from "../models/payment_details";
import { sendSuccess } from "../utils/response";
import { catchAsync } from "../utils/catchAsync";

export class PaymentController {
  public setUpUserPaymentDetails = catchAsync(
    async (req: Request, res: Response) => {
      const { accountName, accountNumber, bankCode, userId } = req.body;
      const user = Payment.build({
        accountName,
        accountNumber,
        bankCode,
        user: userId,
      });

      await user.save();

      sendSuccess(res, 200, "details saved successfully");
    }
  );

  public UpdateUserPaymentDetails = catchAsync(
    async (req: Request, res: Response) => {
      const { accountName, accountNumber, bankCode, userId } = req.body;
      const user = await Payment.findOneAndUpdate(
        {
          user: userId,
        },
        { ...req.body }
      );

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
}
