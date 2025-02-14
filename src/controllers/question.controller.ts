import { Request, Response } from "express";
import { Question } from "../models/questions";
import { sendSuccess } from "../shared/utils/response";
import AppError from "../shared/utils/appError";
import { catchAsync } from "../shared/utils/catchAsync";

export class QuestionController {
  public async createQuestion(req: Request, res: Response) {
    const { content, options, awnser, isconstant, category, image } = req.body;

    let quest = Question.build({
      content,
      options,
      awnser,
      isconstant,
      category,
      image,
    });

    quest = await quest.save();

    sendSuccess(res, 200, quest);
  }

  public async editQuestion(req: Request, res: Response) {
    const question = await Question.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });

    if (!question) {
      throw new AppError("question not found", 400);
    }
    sendSuccess(res, 200, question);
  }

  public createManyQuestions = catchAsync(
    async (req: Request, res: Response) => {
      const advert = await Question.insertMany(req.body);

      sendSuccess(res, 200, advert);
    }
  );

  public async deleteQuestion(req: Request, res: Response) {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      throw new AppError("question not found", 400);
    }
    sendSuccess(res, 200, "question deleted");
  }

  public async getQuestion(req: Request, res: Response) {
    const question = await Question.findById(req.params.id);

    if (!question) {
      throw new AppError("question not found", 400);
    }
    sendSuccess(res, 200, question);
  }

  public async getQuestions(req: Request, res: Response) {
    const questions = await Question.find();

    sendSuccess(res, 200, questions);
  }
}
