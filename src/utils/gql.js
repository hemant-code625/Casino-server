import { gql } from "apollo-server-express";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis();

const typeDefs = gql`
  type Query {
    getGameResults(gameId: String!): GameResult
  }

  type Mutation {
    startGame(betAmount: Float!, mineCount: Int!): GameSession
    selectTile(gameId: String!, position: Int!): TileResult
    cashoutResult(gameId: String!): CashoutResult
  }

  type GameSession {
    gameId: String
    mineCount: Int
    betAmount: Float
    gameOver: Boolean
    rounds: Int
    updatedAt: String
  }

  type GameResult {
    mineCount: Int
    betAmount: Float
    mineField: [String]
    multiplier: Float
    winningAmount: Float
    updatedAt: String
  }
  type CashoutResult {
    mineCount: Int
    betAmount: Float
    mineField: [String]
    multiplier: Float
    winningAmount: Float
    updatedAt: String
  }

  type TileResult {
    isMine: Boolean
    multiplier: Float
    winningAmount: Float
    updatedAt: String
  }
`;

const resolvers = {
  Query: {
    getGameResults: async (_, { gameId }) => {
      const gameData = await redis.get(gameId);
      const game = JSON.parse(gameData);
      return {
        mineCount: game.mineCount,
        mineField: game.gameOver ? game.mineField : [],
        betAmount: game.betAmount,
        multiplier: game.multiplier,
        isWinner: game.betAmount * game.multiplier > 0 ? true : false,
        rounds: game.isWinner ? game.rounds : game.rounds + 1,
        winningAmount:
          game.multiplier == null ? 0 : game.betAmount * game.multiplier,
        updatedAt: game.updatedAt,
      };
    },
  },
  Mutation: {
    startGame: async (_, { betAmount, mineCount }) => {
      const gameId = uuidv4();
      const mineField = generateMineField(mineCount);
      const multiplierArray = generatePayoutMultipliers(25, mineCount, 0.98);
      const updatedAt = new Date().toISOString();
      const gameData = {
        mineField,
        betAmount,
        mineCount,
        gameOver: false,
        rounds: -1,
        positionSelected: [],
        multipliers: multiplierArray,
        updatedAt,
      };

      await redis.set(gameId, JSON.stringify(gameData));

      return { gameId, betAmount, mineCount, updatedAt };
    },
    cashoutResult: async (_, { gameId }) => {
      const gameData = await redis.get(gameId);
      const game = JSON.parse(gameData);

      game.gameOver = true;
      await redis.set(gameId, JSON.stringify(game));
      return {
        mineCount: game.mineCount,
        mineField: game.gameOver ? game.mineField : [],
        betAmount: game.betAmount,
        multiplier: game.multiplier,
        isWinner: game.betAmount * game.multiplier > 0 ? true : false,
        rounds: game.isWinner ? game.rounds : game.rounds + 1,
        winningAmount:
          game.multiplier == null ? 0 : game.betAmount * game.multiplier,
        updatedAt: game.updatedAt,
      };
    },
    selectTile: async (_, { gameId, position }) => {
      const gameData = await redis.get(gameId);
      const game = JSON.parse(gameData);

      if (game.gameOver) {
        return {
          multiplier: game.multiplier,
        };
      }

      if (!Array.isArray(game.positionSelected)) {
        game.positionSelected = [];
      }

      if (!game.positionSelected.includes(position)) {
        game.positionSelected.push(position);
        game.rounds += 1;
      }

      const isMine = game.mineField[position] === "M";
      const isGem = game.mineField[position] === "G";
      const updatedAt = new Date().toISOString();
      game.isMine = isMine;
      game.updatedAt = updatedAt;

      if (isMine) {
        game.gameOver = true;
        game.isWinner = false;
        game.multiplier = 0;
        game.winningAmount = 0;
      } else if (
        isGem &&
        !game.gameOver &&
        game.rounds < game.multipliers.length
      ) {
        game.multiplier = game.multipliers[game.rounds].payoutMultiplier;
        game.winningAmount = game.betAmount * game.multiplier;
      } else if (game.gameOver) {
        throw new Error("Game over. You can't select any more tiles.");
      } else {
        throw new Error("Invalid rounds index for multipliers array.");
      }

      await redis.set(gameId, JSON.stringify(game));

      return {
        isMine,
        multiplier: game.multiplier,
        winningAmount: game.winningAmount,
        updatedAt,
      };
    },
  },
};

const generateMineField = (mineCount) => {
  const size = 25;
  const mineField = Array(size).fill("G"); // Fill with 'G' for gems initially

  let placedMines = 0;
  while (placedMines < mineCount) {
    const randomIndex = Math.floor(Math.random() * size);
    if (mineField[randomIndex] !== "M") {
      mineField[randomIndex] = "M"; // Place a mine
      placedMines++;
    }
  }
  return mineField;
};

const generatePayoutMultipliers = (
  totalFields,
  mines,
  houseMultiplier = 0.98
) => {
  let safeFields = totalFields - mines;
  let multipliers = [];
  let baseMultiplier = 1.0;
  let increment = 0.051;

  for (let i = 0; i < totalFields; i++) {
    if (safeFields <= 0) break;

    let probability = safeFields / (totalFields - i);
    let payoutMultiplier = (baseMultiplier / probability) * houseMultiplier;

    multipliers.push({
      field: i,
      payoutMultiplier: parseFloat(payoutMultiplier.toFixed(4)),
    });

    safeFields--;
    baseMultiplier += increment;
  }
  // Fill the rest of the fields with 0.0 payout multiplier for mines
  while (multipliers.length < totalFields) {
    multipliers.push({
      field: multipliers.length,
      payoutMultiplier: 0.0,
    });
  }
  return multipliers;
};

export { typeDefs, resolvers };
