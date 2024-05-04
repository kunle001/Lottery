import express from "express";
import { GameController } from "../controllers/game.controller";
import { requireAuth } from "../middlewares/current_user";

const router = express.Router();
const gameController = new GameController();

router.use(requireAuth);
router.route("/start").get(gameController.startGame);
router.route("/end/:id").post(gameController.endGame);
router.route("/today-result").get(gameController.getTodayGameResult);

export { router as gameRouter };
