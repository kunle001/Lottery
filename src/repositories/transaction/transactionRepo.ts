import {
  TransactionAttr,
  TransactionDoc,
  TransactionModel,
} from "../../models/transaction";
import AppError from "../../shared/utils/appError";
import { IpopulateFields } from "../user/IUser";
import { ITransactionRepository } from "./ITransaction";

export class TransactionRepo implements ITransactionRepository {
  private model: TransactionModel;

  constructor(model_: TransactionModel) {
    this.model = model_;
  }

  async findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<TransactionDoc | null> {
    // Implementation to fetch Transaction by ID from the database
    const query = this.model.findById(id);
    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Transaction = await query;
    return Transaction;
  }

  async findOne(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<TransactionDoc | null> {
    // Implementation to fetch Transaction by ID from the database

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
    const Transaction = await query_;

    return Transaction!;
  }

  async findMany(
    field: string,
    value: string,
    populateFields?: IpopulateFields[]
  ): Promise<TransactionDoc[] | null> {
    // Implementation to fetch Transaction by ID from the database

    let query = this.model.find({
      [field]: value,
    });

    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Transaction = await query;

    return Transaction!;
  }

  async findAll(): Promise<TransactionDoc[]> {
    const Transaction = await this.model.find();

    return Transaction;
  }

  async create(data: TransactionAttr): Promise<TransactionDoc> {
    try {
      const Transaction = await this.model.create(data);

      return Transaction;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }

  async update(
    id: string,
    Transaction: TransactionDoc
  ): Promise<TransactionDoc | null> {
    try {
      const Transaction_ = await this.model.findByIdAndUpdate(id, Transaction);

      return Transaction_;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
    // Implementation to update a Transaction in the database
  }

  async delete(id: string): Promise<boolean> {
    try {
      const Transaction = await this.model.findByIdAndDelete(id);
      if (!Transaction) {
        return false;
      }
      return true;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }
}
