import express from "express";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();
const paymentController = new PaymentController();

router.route("/withdraw").post(paymentController.withdrawCash);
router.route("/webhook").post(paymentController.WebHook);
router.route("/name-inquiry").post(paymentController.NameEnquiry_);

export { router as TransactionRouter };
