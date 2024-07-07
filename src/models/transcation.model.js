import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: [String],
      enum: ["Deposit", "Withdrawal"],
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
