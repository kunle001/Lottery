import { QuestionAttr, QuestionDoc } from "../../models/questions";
import { IpopulateFields } from "../user/IUser";

export interface IQuestionRepo {
  findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<QuestionDoc | null>;

  findOne(
    query: Record<string, any>, // Corrected syntax
    populateFields?: IpopulateFields[]
  ): Promise<QuestionDoc | null>;

  findMany(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<QuestionDoc[] | null>;

  findAll(): Promise<QuestionDoc[]>;

  create(data: QuestionAttr): Promise<QuestionDoc>;

  update(id: string, Question: QuestionAttr): Promise<QuestionDoc | null>;

  delete(id: string): Promise<boolean>;
}

export interface ILocation {
  latitude: number;
  longitude: number;
}
