import { Advert, AdvertDoc } from "../models/advert";
import { Question, QuestionDoc } from "../models/questions";
import AppError from "./appError";

export function getRandomRange(min: number, max: number, rangeSize: number) {
    const validMax = max - rangeSize + 1;
    if (validMax < min) {
        throw new AppError("Invalid range size", 500);
    }
    const start = Math.floor(Math.random() * validMax) + min;
    return [start, start + rangeSize - 1];
}

export async function selectRandomData(type:"question"|"advert") {
    
    switch (type){
        case "question":
            const selectedQuestions: QuestionDoc[] = [];
            const questions= await Question.find()

            const ranges = getRandomRange(0, questions.length, 10);
        
            for (let i = 0; i < ranges.length; i++) {
                const range = ranges[i];
                selectedQuestions.push(questions[range]);
            }
        
            return selectedQuestions;
        case "advert":
            const selectedAdvert: AdvertDoc[] = [];
            const advert= await Advert.find()

            const advert_ranges = getRandomRange(0, advert.length, 2);
        
            for (let i = 0; i < advert_ranges.length; i++) {
                const range = advert_ranges[i];
                selectedAdvert.push(advert[range]);
            }
        
            return selectedAdvert;
    }
    
}

