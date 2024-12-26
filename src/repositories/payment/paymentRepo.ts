import {
  PaymentAttr,
  PaymentDoc,
  PaymentModel,
} from "../../models/payment_details";
import AppError from "../../shared/utils/appError";
import { IpopulateFields } from "../user/IUser";
import { IPaymentRepository } from "./IPayment";

export class PaymentRepo implements IPaymentRepository {
  private model: PaymentModel;

  constructor(model_: PaymentModel) {
    this.model = model_;
  }

  async findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<PaymentDoc | null> {
    // Implementation to fetch Payment by ID from the database
    const query = this.model.findById(id);
    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Payment = await query;
    return Payment;
  }

  async findOne(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<PaymentDoc | null> {
    // Implementation to fetch Payment by ID from the database

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
    const Payment = await query_;

    return Payment!;
  }

  async findMany(
    field: string,
    value: string,
    populateFields?: IpopulateFields[]
  ): Promise<PaymentDoc[] | null> {
    // Implementation to fetch Payment by ID from the database

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
    const Payment = await query;

    return Payment!;
  }

  async findAll(): Promise<PaymentDoc[]> {
    const Payment = await this.model.find();

    return Payment;
  }

  async create(data: PaymentAttr): Promise<PaymentDoc> {
    try {
      const Payment = await this.model.create(data);

      return Payment;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }

  async update(id: string, Payment: PaymentDoc): Promise<PaymentDoc | null> {
    try {
      const Payment_ = await this.model.findByIdAndUpdate(id, Payment);

      return Payment_;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
    // Implementation to update a Payment in the database
  }

  async delete(id: string): Promise<boolean> {
    try {
      const Payment = await this.model.findByIdAndDelete(id);
      if (!Payment) {
        return false;
      }
      return true;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }
}
