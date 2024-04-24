import { Request, Response, NextFunction } from "express";
import { Question } from "../models/questions";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/response";
import { Player } from "../models/players";
import AppError from "../utils/appError";
import { selectRandomData } from "../utils/randomPicker";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

interface GameAnswer {
    questionId: string,
    answer: string
}

interface AnswerStats {
    end_time: number,
    answers: GameAnswer[]
}

export class GameController {
    public startGame = catchAsync(async (req: Request, res: Response) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the beginning of the day
        
        const exisitingPlayer = await Player.findOne({
            user: req.currentUser?.id,
            started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) } // 86400000 milliseconds in a day
        });

        if (exisitingPlayer) {
            throw new AppError("You have already played today, try again tomorrow", 400);
        }

        let player= Player.build({
            user: req.currentUser!.id,
            started_at: new Date()
        })

        player= await player.save()


        const gameQuestion= await selectRandomData("question")
        const adverts= await selectRandomData("advert")

        sendSuccess(res, 201,{
            player, 
            questions: gameQuestion,
            adverts
        },"game started")        
    });

    public endGame = catchAsync(async (req: Request, res: Response) => {
        // Implementation for ending the game
        let player = await Player.findById(req.params.id)
        if (!player){
            throw new AppError("player not found")
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

        const result = correctQuestions / player.started_at-userAnswers.end_time - (30 * 1000);


        player?.set({
            played_today: true, 
            score: result,
        })

        await player?.save()

        sendSuccess(res,200,player,"game ended sucessfully")
    });

    public getTodayGameResult = catchAsync(async (req: Request, res: Response) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the beginning of the day
        
        const todaysGame = await Player.findOne({
            started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) } // 86400000 milliseconds in a day
        });

        sendSuccess(res, 200,todaysGame)
    });

    public userScore = catchAsync(async (req: Request, res: Response) => {
        // Implementation for fetching user's score
    });

    public allScores = catchAsync(async (req: Request, res: Response) => {
        // Implementation for fetching all scores
    });
}
