import {
  Withdrawal,
  WithdrawalAttr,
  WithdrawalDoc,
  WithdrawalModel,
} from "../../models/withdrawalRequest";
import AppError from "../../shared/utils/appError";
import { IpopulateFields } from "../user/IUser";
import { IWithdrawalRepository } from "./IWithdrawal";

export class WithdrawalRepo implements IWithdrawalRepository {
  private model: WithdrawalModel;

  constructor(model_: WithdrawalModel) {
    this.model = model_;
  }

  async findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<WithdrawalDoc | null> {
    // Implementation to fetch Withdrawal by ID from the database
    const query = this.model.findById(id);
    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Withdrawal = await query;
    return Withdrawal;
  }

  async findOne(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<WithdrawalDoc | null> {
    // Implementation to fetch Withdrawal by ID from the database

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
    const Withdrawal = await query_;

    return Withdrawal!;
  }

  async findMany(
    query: Record<string, any>,
    populateFields?: IpopulateFields[],
    page?: number,
    pageSize?: number
  ): Promise<WithdrawalDoc[] | null> {
    // Implementation to fetch Withdrawal by ID from the database
    page = page || 1;
    pageSize = pageSize || 50;
    let query_ = this.model.find(query);

    const skip = (page - 1) * pageSize;

    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query_.populate(populateOptions);
      });
    }
    const Withdrawal = await query_.skip(skip).limit(pageSize);

    return Withdrawal!;
  }

  async findAll(page?: number, pageSize?: number): Promise<WithdrawalDoc[]> {
    page = page || 1;
    pageSize = pageSize || 50;
    const skip = (page - 1) * pageSize;
    const Withdrawal = await this.model.find().skip(skip).limit(pageSize);

    return Withdrawal;
  }

  async create(data: WithdrawalAttr): Promise<WithdrawalDoc> {
    try {
      const withdrawal = await this.model.create(data);

      return withdrawal;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }

  async update(
    id: string,
    Withdrawal: WithdrawalDoc
  ): Promise<WithdrawalDoc | null> {
    try {
      const withdrawal_ = await this.model.findByIdAndUpdate(id, Withdrawal);

      return withdrawal_;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
    // Implementation to update a Withdrawal in the database
  }

  async delete(id: string): Promise<boolean> {
    try {
      const withdrawal = await this.model.findByIdAndDelete(id);
      if (!withdrawal) {
        return false;
      }
      return true;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }
}
