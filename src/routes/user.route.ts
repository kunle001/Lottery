import express from "express";
import { UserController } from "../controllers/user.controller";
import { PaymentController } from "../controllers/payment.controller";
import { uploadImage, uploadSingleImage } from "../utils/upload";
import { RestrictAccessto, requireAuth } from "../middlewares/current_user";
import { AuthController } from "../controllers/auth.controller";

const router = express.Router();
const userController = new UserController();
const authController = new AuthController();
const paymentController = new PaymentController();

router.route("/list-of-banks").get(userController.listOfBanks);

router.use(requireAuth);
router.route("/add-interest").post(userController.addInterest);
router.route("/my-profile").get(userController.myProfile);
router.route("/my-chances").get(userController.MyChances);
router.route("/update-profile").patch(userController.updateProfile);
router.route("/balance").get(userController.GetAccountBalance);
router
  .route("/request/question-creation")
  .post(userController.RequestQuestionCreation);

router
  .route("/set-payment-details")
  .post(paymentController.setUpUserPaymentDetails);
router
  .route("/update-payment-detils")
  .patch(paymentController.UpdateUserPaymentDetails);
router.route("/request/withdrawal").post(userController.RequestWithdrawal);

router
  .route("/upload-file")
  .post(
    uploadSingleImage.single("image"),
    uploadImage,
    userController.uploadFile
  );
router
  .route("/user-withdrawals/:id")
  .get(userController.GetUserWithdrawlRequest);
router.use(RestrictAccessto(["admin"]));
router.route("/block/:id").get(userController.BlockUser);
router.route("/unblock/:id").get(userController.UnBlockUser);
router.route("/all").get(userController.GetAllUsers);
router.route("/enable/2fa").post(authController.Twofa);
router.route("/verify/2fa").post(authController.VerifyTwofa);
router.route("/2fa/gettoken").get(authController.GetToken);
router.route("/withdrawal/approve/:id").get(userController.ApproveRequest);
router.route("/withdrawals").get(userController.GetAllRequests);
router.route("/withdrawals/:id").get(userController.GetAllRequest);

router
  .route("/withdrawal/disapprove/:id")
  .get(userController.DisApproveRequest);
router.route("/:id").get(userController.GetUserFullDetails);
export { router as UserRouter };
