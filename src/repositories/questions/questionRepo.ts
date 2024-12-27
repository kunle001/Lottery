import {
  QuestionAttr,
  QuestionDoc,
  QuestionModel,
} from "../../models/questions";
import AppError from "../../shared/utils/appError";
import { IpopulateFields } from "../user/IUser";
import { IQuestionRepo } from "./IQuestion";

export class QuestionRepo implements IQuestionRepo {
  private model: QuestionModel;

  constructor(model_: QuestionModel) {
    this.model = model_;
  }

  async findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<QuestionDoc | null> {
    // Implementation to fetch Question by ID from the database
    const query = this.model.findById(id);
    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Question = await query;
    return Question;
  }

  async findOne(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<QuestionDoc | null> {
    // Implementation to fetch Question by ID from the database

    let query_ = this.model.findOne({
      ...query,
    });

    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Question = await query_;

    return Question!;
  }

  async findMany(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<QuestionDoc[] | null> {
    // Implementation to fetch Question by ID from the database

    let query_ = this.model.find(query);

    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query_.populate(populateOptions);
      });
    }
    const Question = await query_;

    return Question!;
  }

  async findAll(): Promise<QuestionDoc[]> {
    const Question = await this.model.find();

    return Question;
  }

  async create(data: QuestionAttr): Promise<QuestionDoc> {
    try {
      const Question = await this.model.create(data);

      return Question;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }

  async update(
    id: string,
    Question: QuestionAttr
  ): Promise<QuestionDoc | null> {
    try {
      const Question_ = await this.model.findByIdAndUpdate(id, Question);

      return Question_;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
    // Implementation to update a Question in the database
  }

  async delete(id: string): Promise<boolean> {
    try {
      const Question = await this.model.findByIdAndDelete(id);
      if (!Question) {
        return false;
      }
      return true;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }
}
