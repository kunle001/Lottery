// // UserRepository.ts
import { User, UserAttr, UserDoc, UserModel } from "../../models/user";
import AppError from "../../shared/utils/appError";
import { IpopulateFields, IUpdateUser, IUserRepository } from "./IUser";

export class UserRepository implements IUserRepository {
  private model: UserModel;

  constructor(model_: UserModel) {
    this.model = model_;
  }

  async findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<UserDoc | null> {
    // Implementation to fetch user by ID from the database
    const query = this.model.findById(id);
    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const user = await query;
    return user;
  }

  async findOne(
    field: string,
    value: string,
    populateFields?: IpopulateFields[]
  ): Promise<UserDoc | null> {
    // Implementation to fetch user by ID from the database

    let query = this.model.findOne({
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
    const user = await query;

    return user!;
  }

  async findMany(
    field: string,
    value: string,
    populateFields?: IpopulateFields[],
    page?: number,
    pageSize?: number
  ): Promise<UserDoc[] | null> {
    page = page || 1;
    pageSize = pageSize || 50;

    const skip = (page - 1) * pageSize;
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
    const user = await query.skip(skip).limit(pageSize);

    return user!;
  }

  async findAll(
    page?: number,
    pageSize?: number,
    populateFields?: IpopulateFields[]
  ): Promise<UserDoc[]> {
    page = page || 1;
    pageSize = pageSize || 50;

    const skip = (page - 1) * pageSize;
    let query = this.model.find();

    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const user = await query.skip(skip).limit(pageSize);

    return user;
  }

  async create(data: UserAttr): Promise<UserDoc> {
    try {
      const user = await this.model.create(data);

      return user;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }

  async update(id: string, user: IUpdateUser): Promise<UserDoc | null> {
    try {
      const user_ = await this.model.findByIdAndUpdate(id, user);

      return user_;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
    // Implementation to update a user in the database
  }

  async delete(query: Record<string, any>): Promise<boolean> {
    try {
      const user = await this.model.findOneAndDelete(query);
      if (!user) {
        return false;
      }
      return true;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }
}
