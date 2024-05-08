import express from "express";
import { UserController } from "../controllers/user.controller";

const router = express.Router();
const userController = new UserController();

router.route("/add-interest").post(userController.addInterest);

export { router as UserRouter };
