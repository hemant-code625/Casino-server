import mongoose from "mongoose";

const PlayerPerformanceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    playedGames: {
      type: [String],
      enum: ["Casino", "Opinon Trading", "Sports Betting"],
      required: true,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    totalBetAmount: {
      type: Number,
      default: 0,
    },
    totalWinningAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PlayerPerformanceModel = mongoose.model(
  "PlayerPerformance",
  PlayerPerformanceSchema
);

export default PlayerPerformanceModel;
