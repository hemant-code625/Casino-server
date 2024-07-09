import { gql } from "apollo-server-express";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis();

// GraphQL schema definition
const typeDefs = gql`
  type Query {
    getGameResults(gameId: String!): GameResult
  }

  type Mutation {
    startGame(betAmount: Float!, mineCount: Int!): GameSession
    selectTile(gameId: String!, position: Int!): GameResult
  }

  type GameSession {
    gameId: String
  }

  type GameResult {
    mineField: [String]
    isMine: Boolean
    updatedAt: String
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    getGameResults: async (_, { gameId }) => {
      const gameData = await redis.get(gameId);
      return JSON.parse(gameData);
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
        updatedAt,
      };

      await redis.set(gameId, JSON.stringify(gameData));

      return { gameId };
    },
    selectTile: async (_, { gameId, position }) => {
      const gameData = await redis.get(gameId);
      const game = JSON.parse(gameData);

      const isMine = game.mineField[position] === "M";
      const updatedAt = new Date().toISOString();
      game.isMine = isMine;
      game.updatedAt = updatedAt;

      await redis.set(gameId, JSON.stringify(game));

      return {
        mineField: game.mineField,
        isMine,
        updatedAt,
      };
    },
  },
};

// Generate minefield with mines placed randomly
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
  console.log("Mine Field: ", mineField);
  return mineField;
};

export { typeDefs, resolvers };
