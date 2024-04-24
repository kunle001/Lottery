import mongoose from "mongoose";
import { Password } from "../utils/Password";

interface PlayerAttr {
    user: string
    started_at: Date
    // ended_at: Date
    // score: number
    // played_today: boolean
}

interface PlayerDoc extends mongoose.Document {
    user: string
    started_at: number
    ended_at: Date
    score: number
    played_today: boolean
}

interface PlayerModel extends mongoose.Model<PlayerDoc> {
    build(attr: PlayerAttr): PlayerDoc
}

const PlayerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, 
    started_at: {
        type: Number,
        default: Date.now()
    }, 
    score: {
        type: Number,
        default: 0
    },
    ended_at:{
        type: Number,
        default: Date.now()
    },
    played_today: {
        type: Date, 
        default: Date.now()
    }
},
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

PlayerSchema.index({score: 1})

PlayerSchema.statics.build = (attrs: PlayerAttr) => {
    return new Player(attrs);
};

PlayerSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
      const hashed = await Password.toHash(this.get('password')!);
      this.set('password', hashed)
    };
    done();
  });
  
  
const Player = mongoose.model<PlayerDoc, PlayerModel>('Player', PlayerSchema);
  
  export { Player };
  