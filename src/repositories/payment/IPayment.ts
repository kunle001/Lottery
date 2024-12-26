import { PaymentAttr, PaymentDoc } from "../../models/payment_details";
import { IpopulateFields } from "../user/IUser";

export interface IPaymentRepository {
  findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<PaymentDoc | null>;
  findOne(
    query: Record<string, any>, // Corrected syntax
    populateFields?: IpopulateFields[]
  ): Promise<PaymentDoc | null>;
  findAll(): Promise<PaymentDoc[]>;
  create(Payment: PaymentAttr): Promise<PaymentDoc>;
  update(id: string, Payment: IUpdatePayment): Promise<PaymentDoc | null>;
  delete(id: string): Promise<boolean>;
}

export interface IUpdatePayment {
  user?: string;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  paystackAccountId?: string;
}
