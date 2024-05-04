import { Request, Response } from "express";
import { Question } from "../models/questions";
import { sendSuccess } from "../utils/response";

export class QuestionController {
  public async createQuestion(req: Request, res: Response) {
    const { content, options, awnser, isconstant } = req.body;

    let quest = Question.build({
      content,
      options,
      awnser,
      isconstant,
    });

    quest = await quest.save();

    sendSuccess(res, 200, quest);
  }

  public async editQuestion(req: Request, res: Response) {}

  public async deleteQuestion(req: Request, res: Response) {}

  public async getQuestion(req: Request, res: Response) {}

  public async getQuestions(req: Request, res: Response) {}
}
