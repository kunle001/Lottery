import { ADVERTS_PERGAME, QUESTIONS_PERGAME } from "../../config";
import { Advert, AdvertDoc } from "../../models/advert";
import { Question, QuestionAttr, QuestionDoc } from "../../models/questions";
import AppError from "./appError";
import fs, { readFile } from "fs";

export function getRandomRange(min: number, max: number, rangeSize: number) {
  if (rangeSize > max - min + 1) {
    throw new AppError("Invalid range size", 500);
  }

  const validMax = max - rangeSize + 1;
  if (validMax < min) {
    throw new AppError("Invalid range size", 500);
  }

  const start = Math.floor(Math.random() * validMax) + min;
  return [start, start + rangeSize - 1];
}

export async function selectRandomData(
  type: "question" | "advert",
  numberOfData: number = 6
) {
  switch (type) {
    case "question":
      const selectedQuestions: QuestionDoc[] = [];
      const questions = await Question.find({
        isconstant: false,
      });
      const [start, end] = getRandomRange(
        0,
        questions.length,
        Number(QUESTIONS_PERGAME)
      );

      for (let i = start; i <= end; i++) {
        // Corrected loop to iterate from start to end
        selectedQuestions.push(questions[i]);
      }

      return selectedQuestions;
    case "advert":
      const selectedAdvert: AdvertDoc[] = [];
      const advert = await Advert.find();
      const [startAdv, endAdv] = getRandomRange(
        0,
        advert.length,
        numberOfData || Number(ADVERTS_PERGAME)
      );

      for (let i = startAdv; i <= endAdv; i++) {
        // Corrected loop to iterate from start to end
        selectedAdvert.push(advert[i]);
      }

      return selectedAdvert;
  }
}

export const createQuestions = async (filepath: string) => {
  const questions = readQuestions(filepath);
  const total_question = questions.length;
  for (let [index, question] of questions.entries()) {
    console.log(question);
    await Question.create({
      ...question,
    });
    console.log(`created ${index++} of ${total_question} `);
  }
};

function readQuestions(filePath: string): QuestionAttr[] {
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const questions: QuestionAttr[] = JSON.parse(jsonData);
  return questions;
}
