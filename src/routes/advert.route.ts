import express from "express";
import { AdvertController } from "../controllers/advert.controller";

const router = express.Router();
const advertController = new AdvertController();

router.route("/").post(advertController.createAdvert);

router.route("/").get(advertController.getAdverts);
router.route("/policy").get(advertController.quizmePolicy);
router.route("/terms-and-condition").get(advertController.termsAndCondition);
router.route("/:id").get(advertController.getAdvert);
router.route("/:id").patch(advertController.updateAdvert);
router.route("/:id").delete(advertController.deleteAdvert);

export { router as advertRouter };
