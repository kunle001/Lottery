import { AdvertDoc } from "../models/advert";
import { PlayerDoc } from "../models/players";
import { QuestionDoc } from "../models/questions";
import { ILocation, IPlayerRepo } from "../repositories/game-players/IPlayer";
import { IQuestionRepo } from "../repositories/questions/IQuestion";
import AppError from "../shared/utils/appError";
import { selectRandomData } from "../shared/utils/randomPicker";

export interface IStartgame {
  questions: QuestionDoc[];
  playerId: string;
  games_played: number;
  player: PlayerDoc;
  adverts?: AdvertDoc[];
}

export class GameService {
  private gameRepo: IPlayerRepo;

  private questionRepo: IQuestionRepo;

  constructor(gameRepo_: IPlayerRepo, questionsRepo_: IQuestionRepo) {
    this.gameRepo = gameRepo_;
    this.questionRepo = questionsRepo_;
  }

  async startGame(userId: string, location: ILocation): Promise<IStartgame> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingPlayer = await this.gameRepo.findOrUpdateExistinngPlayer(
      userId,
      today,
      location
    );

    const time_left =
      today.getTime() + 86400000 - (existingPlayer.started_at?.getTime() || 0);

    const time_left_hours = time_left / (1000 * 60 * 60);

    if (existingPlayer.chances <= 0) {
      throw new AppError(
        `try again in ${Math.floor(time_left_hours)} ${
          time_left_hours < 2 ? "Hour" : "Hours"
        },  `,
        400
      );
    }

    const gameQuestion = await selectRandomData("question");
    const adverts = await selectRandomData("advert");
    const constantQuestions = await this.gameRepo.findMany({
      isconstant: true,
    });

    if (!constantQuestions) {
      throw new AppError("could not find constant questions");
    }

    // takes the minimum value between player's no of plays and 5
    const stage = existingPlayer ? Math.min(existingPlayer.no_of_plays, 4) : 0;

    const constantQuestionsSlice = constantQuestions.slice(
      stage * 2,
      stage * 2 + 2
    );

    // increment no of plays
    await this.gameRepo.update(existingPlayer.id, {
      no_of_plays: existingPlayer.no_of_plays + 1,
      chances: existingPlayer.chances - 1,
    });

    return {
      questions: gameQuestion as QuestionDoc[],
      playerId: existingPlayer.id,
      games_played: existingPlayer.no_of_plays,
      player: existingPlayer,
    };
  }
}
