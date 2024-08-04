import mongoose from "mongoose";

const MineGameSchema = new mongoose.Schema(
  {
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
    expireAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Create a TTL index on the expireAt field
MineGameSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const MineGameModel = mongoose.model("MineGame", MineGameSchema);

export default MineGameModel;
