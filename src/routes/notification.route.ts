import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

router.route("/user/:id").get(NotificationController.getUserNotification);

export { router as NotificationRouter };
