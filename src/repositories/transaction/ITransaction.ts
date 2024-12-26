import { TransactionAttr, TransactionDoc } from "../../models/transaction";
import { IpopulateFields } from "../user/IUser";

export interface ITransactionRepository {
  findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<TransactionDoc | null>;
  findOne(
    query: Record<string, any>, // Corrected syntax
    populateFields?: IpopulateFields[]
  ): Promise<TransactionDoc | null>;
  findAll(): Promise<TransactionDoc[]>;
  create(Transaction: TransactionAttr): Promise<TransactionDoc>;
  update(
    id: string,
    Transaction: TransactionDoc
  ): Promise<TransactionDoc | null>;
  delete(id: string): Promise<boolean>;
}
