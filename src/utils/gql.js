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
  }

  type GameSession {
    gameId: String
    mineCount: Int
    betAmount: Float
    gameOver: Boolean
    updatedAt: String
  }

  type GameResult {
    mineCount: Int
    betAmount: Float
    winningAmount: Float
    mineField: [String]
    updatedAt: String
  }

  type TileResult {
    isMine: Boolean
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
        winningAmount: game.winningAmount || 0,
        updatedAt: game.updatedAt,
      };
    },
  },
  Mutation: {
    startGame: async (_, { betAmount, mineCount }) => {
      const gameId = uuidv4();
      const mineField = generateMineField(mineCount);
      const updatedAt = new Date().toISOString();
      const gameData = {
        mineField,
        betAmount,
        mineCount,
        gameOver: false,
        updatedAt,
      };

      await redis.set(gameId, JSON.stringify(gameData));

      return { gameId, betAmount, mineCount, updatedAt };
    },
    selectTile: async (_, { gameId, position }) => {
      const gameData = await redis.get(gameId);
      const game = JSON.parse(gameData);

      const isMine = game.mineField[position] === "M";
      const updatedAt = new Date().toISOString();
      game.isMine = isMine;
      game.updatedAt = updatedAt;

      await redis.set(gameId, JSON.stringify(game));
      if (isMine) {
        game.gameOver = true;
      }
      await redis.set(gameId, JSON.stringify(game));
      return {
        isMine,
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

export { typeDefs, resolvers };
