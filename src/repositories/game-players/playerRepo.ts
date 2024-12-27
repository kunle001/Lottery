import { PlayerAttr, PlayerDoc, PlayerModel } from "../../models/players";
import AppError from "../../shared/utils/appError";
import { IpopulateFields } from "../user/IUser";
import { ILocation, IPlayerRepo, IUpdatePlayer } from "./IPlayer";

export class PlayerRepo implements IPlayerRepo {
  private model: PlayerModel;

  constructor(model_: PlayerModel) {
    this.model = model_;
  }

  async findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<PlayerDoc | null> {
    // Implementation to fetch Player by ID from the database
    const query = this.model.findById(id);
    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Player = await query;
    return Player;
  }

  async findOne(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<PlayerDoc | null> {
    // Implementation to fetch Player by ID from the database

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
    const Player = await query_;

    return Player!;
  }

  async findMany(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<PlayerDoc[] | null> {
    // Implementation to fetch Player by ID from the database

    let query_ = this.model.find(query);

    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query_.populate(populateOptions);
      });
    }
    const Player = await query_;

    return Player!;
  }

  async findAll(): Promise<PlayerDoc[]> {
    const Player = await this.model.find();

    return Player;
  }

  async create(data: PlayerAttr): Promise<PlayerDoc> {
    try {
      const Player = await this.model.create(data);

      return Player;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }

  async update(id: string, Player: IUpdatePlayer): Promise<PlayerDoc | null> {
    try {
      const Player_ = await this.model.findByIdAndUpdate(id, Player);

      return Player_;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
    // Implementation to update a Player in the database
  }

  async delete(id: string): Promise<boolean> {
    try {
      const Player = await this.model.findByIdAndDelete(id);
      if (!Player) {
        return false;
      }
      return true;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }

  async findOrUpdateExistinngPlayer(
    userId: string,
    date_: Date,
    location: ILocation
  ): Promise<PlayerDoc> {
    const existingPlayer = await this.model.findOneAndUpdate(
      {
        user: userId,
        started_at: { $gte: date_, $lt: new Date(date_.getTime() + 86400000) },
      },
      {
        $setOnInsert: {
          // This sets fields only when creating a new document
          user: userId,
          started_at: new Date(),
          location: {
            coordinates: [location.latitude, location.longitude],
          },
        },
      },
      { new: true, upsert: true }
    );
    return existingPlayer;
  }
}
