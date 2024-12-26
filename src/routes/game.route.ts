import express from "express";
import { GameController } from "../controllers/game.controller";
import { requireAuth } from "../middlewares/current_user";
import { ValidationSchema, validateRequest } from "../shared/utils/validators";

const router = express.Router();
const gameController = new GameController();
const validator = new ValidationSchema();

router.use(requireAuth);
router.route("/start").get(gameController.startGame);
router.route("/end/:id").post(gameController.endGame);
router.route("/today-result").get(gameController.topScores);
router.route("/user-history/:id").get(gameController.userGameHistory);
router.route("/increment-chance").get(gameController.AddMoreChancesToUser);
router
  .route("/get-record-bydate")
  .post(
    validateRequest(validator.getRecordByDate()),
    gameController.resultByDay
  );

export { router as gameRouter };
