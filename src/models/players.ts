import mongoose, { Query } from "mongoose";
import { Password } from "../shared/utils/Password";
import { MAXIMUM_CHANCES } from "../config";

export interface PlayerAttr {
  user: string;
  started_at: Date;
  //   ended_at: Date;
  //   score: number;
  location: {
    // type: string;
    coordinates: number[];
    //   address?: string;
    //   description?: string;
  };
  //   played_today: boolean;
  no_of_plays?: number;
}

export interface PlayerDoc extends mongoose.Document {
  user: string;
  started_at: Date;
  ended_at: Date;
  score: number;
  location: {
    type: string;
    coordinates: number[];
    //   address?: string;
    //   description?: string;
  };
  game_score: number;
  played_today: boolean;
  no_of_plays: number;
  time_taken: number;
  chances: number;
  incremented_chances: number;
}
export interface PlayerModel extends mongoose.Model<PlayerDoc> {
  build(attr: PlayerAttr): PlayerDoc;
}

const PlayerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    started_at: {
      type: Date,
      default: new Date(),
    },
    score: {
      type: Number,
      default: 0,
    },
    ended_at: {
      type: Date,
      //   default: Date.now(),
    },
    time_taken: Number,
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      // address: String,
      // description: String
    },
    played_today: {
      type: Boolean,
      default: false,
    },
    game_score: Number,
    incremented_chances: {
      type: Number,
      default: 0,
    },
    no_of_plays: {
      type: Number,
      default: 0,
    },
    chances: {
      type: Number,
      default: MAXIMUM_CHANCES,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        delete ret.ended_at;
        delete ret.location;
      },
    },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

PlayerSchema.index({ game_score: -1, time_taken: 1 });
PlayerSchema.statics.build = (attrs: PlayerAttr) => {
  return new Player(attrs);
};

PlayerSchema.pre<Query<any, any>>(/^find/, function (next) {
  this.sort({ game_score: -1, time_taken: 1 });
  next();
});
const Player = mongoose.model<PlayerDoc, PlayerModel>("Player", PlayerSchema);

export { Player };
