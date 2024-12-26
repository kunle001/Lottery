import { PlayerAttr, PlayerDoc } from "../../models/players";
import { IpopulateFields } from "../user/IUser";

export interface IPlayerRepo {
  findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<PlayerDoc | null>;

  findOne(
    query: Record<string, any>, // Corrected syntax
    populateFields?: IpopulateFields[]
  ): Promise<PlayerDoc | null>;

  findMany(
    field: string,
    value: string,
    populateFields?: IpopulateFields[]
  ): Promise<PlayerDoc[] | null>;

  findAll(): Promise<PlayerDoc[]>;

  create(data: PlayerAttr): Promise<PlayerDoc>;

  update(id: string, player: PlayerAttr): Promise<PlayerDoc | null>;

  delete(id: string): Promise<boolean>;
}
