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
    today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const exisitingPlayer = await Player.findOne({
      user: req.currentUser?.id,
      started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) }, // 86400000 milliseconds in a day
    });

    const time_left =
      today.getTime() +
      86400000 -
      (exisitingPlayer?.started_at?.getTime() || 0);

    const time_left_hours = time_left / (1000 * 60 * 60);

    if (exisitingPlayer && exisitingPlayer!.no_of_plays >= 5) {
      throw new AppError(
        `try again in ${Math.floor(time_left_hours)} ${
          time_left_hours < 2 ? "Hour" : "Hours"
        },  `,
        400
      );
    }

    const { lat, long } = req.query;

    if (!exisitingPlayer) {
      console.log("ENTERED ERE!");
      let player = Player.build({
        user: req.currentUser!.id,
        started_at: new Date(),
        location: {
          coordinates: [Number(lat), Number(long)],
        },
      });

      player = await player.save();
    } else {
      // update the number of plays for existing player
      exisitingPlayer.set({
        no_plays: exisitingPlayer.no_of_plays++,
      });
      await exisitingPlayer.save();
    }

    // selecting questions randomly
    var gameQuestion = (await selectRandomData("question")) as any;
    const adverts = await selectRandomData("advert");

    const constant_questions = await Question.find({
      isconstant: true,
    });

    if (exisitingPlayer) {
      switch (exisitingPlayer.no_of_plays) {
        case 1:
          gameQuestion = gameQuestion.concat(constant_questions.slice(2, 4));
        case 2:
          gameQuestion = gameQuestion.concat(constant_questions.slice(4, 6));
        case 3:
          gameQuestion = gameQuestion.concat(constant_questions.slice(6, 8));
        case 4:
          gameQuestion = gameQuestion.concat(constant_questions.slice(8, 10));
      }
    } else {
      gameQuestion.concat(constant_questions.slice(0, 2));
    }

    sendSuccess(
      res,
      201,
      {
        questions: gameQuestion,
        adverts,
      },
      "game started"
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
