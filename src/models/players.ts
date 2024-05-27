import mongoose from "mongoose";
import { Password } from "../utils/Password";

interface PlayerAttr {
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

interface PlayerDoc extends mongoose.Document {
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
  played_today: boolean;
  no_of_plays: number;
}
interface PlayerModel extends mongoose.Model<PlayerDoc> {
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
    no_of_plays: {
      type: Number,
      default: 0,
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
  }
);

PlayerSchema.index({ score: 1 });

PlayerSchema.statics.build = (attrs: PlayerAttr) => {
  return new Player(attrs);
};

const Player = mongoose.model<PlayerDoc, PlayerModel>("Player", PlayerSchema);

export { Player };
