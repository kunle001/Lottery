// IWithdrawalRepository.ts

import { UserDoc } from "../../models/user";
import {
  EWithdrawalSource,
  WithdrawalAttr,
  WithdrawalDoc,
} from "../../models/withdrawalRequest";

export interface IWithdrawalRepository {
  findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<WithdrawalDoc | null>;
  findOne(
    query: Record<string, any>, // Corrected syntax
    populateFields?: IpopulateFields[]
  ): Promise<WithdrawalDoc | null>;
  findAll(page?: number, pageSize?: number): Promise<WithdrawalDoc[]>;
  findMany(
    query: Record<string, any>,
    populateFields?: IpopulateFields[],
    page?: number,
    pageSize?: number
  ): Promise<WithdrawalDoc[] | null>;
  create(Withdrawal: WithdrawalAttr): Promise<WithdrawalDoc>;
  update(
    id: string,
    Withdrawal: IUpdateWithdraw
  ): Promise<WithdrawalDoc | null>;
  delete(id: string): Promise<boolean>;
}

export interface IpopulateFields {
  fieldName: string;
  fieldSubFields?: string[];
}

export interface IUpdateWithdraw {
  user?: string | UserDoc;
  amount?: number;
  status?: "APPROVED" | "DISAPPROVED" | "PENDING";
  approvedBy?: string;
  approvedAt?: string;
  reference?: string;
  source?: EWithdrawalSource;
}
