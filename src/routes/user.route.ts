import express from "express";
import { UserController } from "../controllers/user.controller";
import { PaymentController } from "../controllers/payment.controller";
import { uploadImage, uploadSingleImage } from "../utils/upload";
import { RestrictAccessto, requireAuth } from "../middlewares/current_user";

const router = express.Router();
const userController = new UserController();
const paymentController = new PaymentController();

router.route("/list-of-banks").get(userController.listOfBanks);

router.use(requireAuth);
router.route("/add-interest").post(userController.addInterest);
router.route("/my-profile").get(userController.myProfile);
router.route("/update-profile").patch(userController.updateProfile);

router
  .route("/set-payment-details")
  .post(paymentController.setUpUserPaymentDetails);
router
  .route("/update-payment-detils")
  .patch(paymentController.UpdateUserPaymentDetails);

router
  .route("/upload-file")
  .post(
    uploadSingleImage.single("image"),
    uploadImage,
    userController.uploadFile
  );
router.use(RestrictAccessto(["admin"]));
router.route("/block/:id").get(userController.BlockUser);
router.route("/unblock/:id").get(userController.UnBlockUser);
router.route("/all").get(userController.GetAllUsers);
router.route("/:id").get(userController.GetUserFullDetails);

export { router as UserRouter };
