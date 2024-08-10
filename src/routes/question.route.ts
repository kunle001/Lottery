import express from "express";
import { QuestionController } from "../controllers/question.controller";

const router = express.Router();
const questionController = new QuestionController();

router.route("/").post(questionController.createQuestion);
router.route("/:id").get(questionController.getQuestion);
router.route("/").get(questionController.getQuestion);
router.route("/:id").delete(questionController.deleteQuestion);
router.route("/").patch(questionController.editQuestion);

export { router as questionRouter };
