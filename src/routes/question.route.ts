import express from "express";
import { QuestionController } from "../controllers/question.controller";

const router = express.Router();
const questionController = new QuestionController();

router.route("/").post(questionController.createQuestion);
router.route("/").get(questionController.getQuestions);
router.route("/:id").get(questionController.getQuestion);
router.route("/:id").delete(questionController.deleteQuestion);
router.route("/:id").patch(questionController.editQuestion);

export { router as questionRouter };
