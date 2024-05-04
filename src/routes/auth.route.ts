import express from "express";
import { AuthController } from "../controllers/auth.controller";

const router = express.Router();
const authController = new AuthController();

router.route("/signup").post(authController.signup);
router.route("/signin").post(authController.login);
router.route("/reset-password").post(authController.resetPassword);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/find_existing_username").get(authController.existingUsername);

router.route("/facebook").get(authController.facebook);
router.route("/facebook/callback").get(authController.facebookCallBack);

export { router as authRouter };
