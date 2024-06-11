import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { ValidationSchema, validateRequest } from "../utils/validators";

const router = express.Router();
const authController = new AuthController();
const validatorController = new ValidationSchema();

router.route("/signup").post(authController.signup);
router
  .route("/signin")
  .post(validateRequest(validatorController.login()), authController.login);
router.route("/reset-password").post(authController.resetPassword);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/find_existing_username").get(authController.existingUsername);
router.route("/verify-mail/:id").get(authController.verifyEmail);
router.route("/resend-mail").get(authController.resendEmailVerification);

router.route("/facebook").get(authController.facebook);
router.route("/facebook/callback").get(authController.facebookCallBack);

export { router as authRouter };
