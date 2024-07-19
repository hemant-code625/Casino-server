import mongoose from "mongoose";

const MineGameSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
    },
    mineField: {
      type: [String],
      required: true,
    },
    betAmount: {
      type: Number,
      required: true,
    },
    mineCount: {
      type: Number,
      required: true,
    },
    gameOver: {
      type: Boolean,
      required: true,
    },
    rounds: {
      type: Number,
    },
    positionSelected: {
      type: [Number],
    },
    multipliers: {
      type: [
        {
          field: Number,
          payoutMultiplier: Number,
        },
      ],
      required: true,
    },

    isMine: {
      type: Boolean,
    },
    multiplier: {
      type: Number,
    },
  },
  { timestamps: true }
);

const MineGameModel = mongoose.model("MineGame", MineGameSchema);

export default MineGameModel;
