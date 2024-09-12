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
  awnser: string;
}

interface AnswerStats {
  end_time: Date;
  awnsers: GameAnswer[];
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
          started_at: new Date(),
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

    if (
      (existingPlayer && existingPlayer.no_of_plays >= 1000) ||
      existingPlayer.incremented_chances >= 10000
    ) {
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
      chances: existingPlayer.chances - 1,
    });

    await existingPlayer.save();

    sendSuccess(
      res,
      201,
      {
        questions,
        adverts,
        playerId: existingPlayer.id,
        games_played: existingPlayer.no_of_plays,
      },
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

    for (let i = 0; i < userAnswers.awnsers.length; i++) {
      let answer = userAnswers.awnsers[i];
      let question = await Question.findById(answer.questionId);

      if (question && question.awnser === answer.awnser) {
        correctQuestions++;
      }
    }

    const timeDifferenceInSeconds = Math.abs(
      (new Date().getTime() - player.started_at.getTime()) / 1000
    );
    // Calculate the score based on correct questions and time difference
    const game_score = correctQuestions / 10;
    const score = (game_score * 60) / timeDifferenceInSeconds;

    player?.set({
      played_today: true,
      game_score,
      score,
      time_taken: timeDifferenceInSeconds * 1000,
    });

    await player?.save();

    sendSuccess(res, 200, {
      // player,
      overall_score_pertime: score,
      actual_game_score: game_score,
      time_taken: timeDifferenceInSeconds * 1000, //in milliseconds
    });
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

  public topScores = catchAsync(async (req: Request, res: Response) => {
    // Implementation for fetching user's score
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const top_players_on_date = await Player.find({
      started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
    }).populate("user");

    sendSuccess(res, 200, top_players_on_date);
  });

  public resultByDay = catchAsync(async (req: Request, res: Response) => {
    let { start_date, to_date, no_records } = req.body;
    // setting the time to 12:00 AM
    const today = new Date(Number(start_date));
    today.setHours(0, 0, 0, 0);

    const end_date = new Date(Number(to_date));
    end_date.setHours(0, 0, 0, 0);

    const top_players_on_date = await Player.find({
      started_at: {
        $gte: today,
        $lt: new Date(end_date.getTime() + 86400000),
      },
    })
      .limit(no_records)
      .select("user score")
      .populate("user");

    sendSuccess(res, 200, top_players_on_date);
  });

  public allScores = catchAsync(async (req: Request, res: Response) => {
    // Implementation for fetching all scores
  });

  public userGameHistory = catchAsync(async (req: Request, res: Response) => {
    // Implementation for fetching all scores
    const history = await Player.find({
      user: req.params.id,
    });

    sendSuccess(res, 200, history);
  });

  public AddMoreChancesToUser = catchAsync(
    async (req: Request, res: Response) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const player = await Player.findOne({
        user: req.currentUser?.id,
        started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      });

      if (!player) {
        throw new AppError(
          `you need to have played at least one game before you can increase your chances`,
          400
        );
      }

      player.set({
        incremented_chances: player.incremented_chances + 1,
      });

      await player.save();

      sendSuccess(res, 200, "added 1 chance");
    }
  );
}
