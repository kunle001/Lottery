import { UserAttr, UserDoc } from "../../models/user";
import { IpopulateFields, IUpdateUser } from "../../repositories/user/IUser";

export interface IUserRepository {
  findById(id: string): Promise<UserDoc | null>;

  findOne(
    field: string,
    value: string,
    populateFields?: IpopulateFields[]
  ): Promise<UserDoc | null>;

  findMany(
    field: string,
    value: string,
    populateFields?: IpopulateFields[]
  ): Promise<UserDoc[] | null>;

  findAll(): Promise<UserDoc[]>;
  create(data: UserAttr): Promise<UserDoc>;
  update(id: string, user: IUpdateUser): Promise<UserDoc>;
  delete(id: string): Promise<boolean>;
}
