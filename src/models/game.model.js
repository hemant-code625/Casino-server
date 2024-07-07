import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    gameType: {
      type: [String],
      enum: ["Casino", "Opinon Trading", "Sports Betting"],
      required: true,
    },
  },
  { timestamps: true }
);
