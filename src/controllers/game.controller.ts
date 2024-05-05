import { Request, Response, NextFunction } from "express";
import { Question } from "../models/questions";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/response";
import { Player } from "../models/players";
import AppError from "../utils/appError";
import { selectRandomData } from "../utils/randomPicker";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

interface GameAnswer {
  questionId: string;
  answer: string;
}

interface AnswerStats {
  end_time: Date;
  answers: GameAnswer[];
}

export class GameController {
  public startGame = catchAsync(async (req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingPlayer = await Player.findOneAndUpdate(
      {
        user: req.currentUser?.id,
        started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      },
      {
        $setOnInsert: {
          // This sets fields only when creating a new document
          user: req.currentUser!.id,
          started_at: today,
          location: {
            coordinates: [Number(req.query.lat), Number(req.query.long)],
          },
        },
      },
      { new: true, upsert: true }
    );

    const time_left =
      today.getTime() + 86400000 - (existingPlayer.started_at?.getTime() || 0);

    const time_left_hours = time_left / (1000 * 60 * 60);

    if (existingPlayer && existingPlayer.no_of_plays >= 5) {
      throw new AppError(
        `try again in ${Math.floor(time_left_hours)} ${
          time_left_hours < 2 ? "Hour" : "Hours"
        },  `,
        400
      );
    }

    const gameQuestion = await selectRandomData("question");
    const adverts = await selectRandomData("advert");
    const constantQuestions = await Question.find({ isconstant: true });

    // takes the minimum value between player's no of plays and 5
    const stage = existingPlayer ? Math.min(existingPlayer.no_of_plays, 4) : 0;

    const constantQuestionsSlice = constantQuestions.slice(
      stage * 2,
      stage * 2 + 2
    );
    const questions = gameQuestion.concat(constantQuestionsSlice);
    // increment no of plays
    existingPlayer.set({
      no_of_plays: existingPlayer.no_of_plays + 1,
    });

    await existingPlayer.save();

    sendSuccess(
      res,
      201,
      { questions, adverts, playerId: existingPlayer.id },
      "Game started"
    );
  });

  public endGame = catchAsync(async (req: Request, res: Response) => {
    // Implementation for ending the game
    let player = await Player.findById(req.params.id);
    if (!player) {
      throw new AppError("player not found");
    }

    const userAnswers: AnswerStats = req.body;
    let correctQuestions = 0;

    for (let i = 0; i < userAnswers.answers.length; i++) {
      let answer = userAnswers.answers[i];
      let question = await Question.findById(answer.questionId);

      if (question && question.awnser === answer.answer) {
        correctQuestions++;
      }
    }

    const result =
      correctQuestions / player.started_at.getTime() -
      userAnswers.end_time.getTime() -
      30 * 1000;

    player?.set({
      played_today: true,
      score: result,
    });

    await player?.save();

    sendSuccess(res, 200, player, "game ended sucessfully");
  });

  public getTodayGameResult = catchAsync(
    async (req: Request, res: Response) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

      const todaysGame = await Player.findOne({
        started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) }, // 86400000 milliseconds in a day
      });

      sendSuccess(res, 200, todaysGame);
    }
  );

  public userScore = catchAsync(async (req: Request, res: Response) => {
    // Implementation for fetching user's score
  });

  public allScores = catchAsync(async (req: Request, res: Response) => {
    // Implementation for fetching all scores
  });
}
