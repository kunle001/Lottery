import express from "express";
import { UserController } from "../controllers/user.controller";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();
const userController = new UserController();
const paymentController = new PaymentController();

router.route("/add-interest").post(userController.addInterest);

router.route("/list-of-banks").get(userController.listOfBanks);

router.route("/my-profile").get(userController.myProfile);

router
  .route("/set-payment-detils")
  .get(paymentController.setUpUserPaymentDetails);
router
  .route("/update-payment-detils")
  .get(paymentController.UpdateUserPaymentDetails);

export { router as UserRouter };
