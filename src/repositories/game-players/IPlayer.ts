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
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<PlayerDoc[] | null>;

  findAll(): Promise<PlayerDoc[]>;
  findOrUpdateExistinngPlayer(
    userId: string,
    date_: Date,
    location: ILocation
  ): Promise<PlayerDoc>;

  create(data: PlayerAttr): Promise<PlayerDoc>;

  update(id: string, player: IUpdatePlayer): Promise<PlayerDoc | null>;

  delete(id: string): Promise<boolean>;
}

export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IUpdatePlayer {
  user?: string;
  started_at?: Date;
  ended_at?: Date;
  score?: number;
  location?: {
    type: string;
    coordinates: number[];
    //   address?: string;
    //   description?: string;
  };
  game_score?: number;
  played_today?: boolean;
  no_of_plays?: number;
  time_taken?: number;
  chances?: number;
  incremented_chances?: number;
}
