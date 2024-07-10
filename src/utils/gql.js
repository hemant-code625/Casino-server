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
    rounds: Int
    updatedAt: String
  }

  type GameResult {
    mineCount: Int
    betAmount: Float
    isWinner: Boolean
    rounds: Int
    mineField: [String]
    updatedAt: String
  }

  type TileResult {
    isMine: Boolean
    multiplier: Float
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
        isWinner: game.betAmount * game.multiplier > 0 ? true : false,
        rounds: game.isWinner ? game.rounds : game.rounds + 1,
        // send winning amount instead of multiplier
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
    selectTile: async (_, { gameId, position }) => {
      const gameData = await redis.get(gameId);
      const game = JSON.parse(gameData);

      if (!Array.isArray(game.positionSelected)) {
        game.positionSelected = [];
      }

      if (!game.positionSelected.includes(position)) {
        game.positionSelected.push(position);
        game.rounds += 1;
      }

      const isMine = game.mineField[position] === "M";
      const updatedAt = new Date().toISOString();
      game.isMine = isMine;
      game.updatedAt = updatedAt;

      if (isMine) {
        game.gameOver = true;
        game.isWinner = false;
      } else {
        // Check if game.rounds is within bounds of multipliers array
        if (game.rounds < game.multipliers.length) {
          game.multiplier = game.multipliers[game.rounds].payoutMultiplier;
        } else {
          throw new Error("Invalid rounds index for multipliers array.");
        }
      }

      await redis.set(gameId, JSON.stringify(game));

      return {
        isMine,
        multiplier: game.multiplier,
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

  return multipliers;
};

// function simulateGame(
//   totalFields,
//   mines,
//   houseMultiplier,
//   rounds,
//   simulations = 1000000
// ) {
//   let houseProfit = 0;
//   let playerProfit = 0;

//   for (let i = 0; i < simulations; i++) {
//     let multipliers = generatePayoutMultipliers(
//       totalFields,
//       mines,
//       houseMultiplier
//     );
//     let betAmount = 1; // Assume a constant bet amount for simplicity

//     let roundProfit = 0;
//     let gameOver = false;

//     for (let j = 0; j < multipliers.length; j++) {
//       if (Math.random() < mines / (totalFields - j)) {
//         // Simulate hitting a mine
//         roundProfit -= betAmount;
//         gameOver = true;
//         break;
//       } else {
//         roundProfit += betAmount * (multipliers[j].payoutMultiplier - 1);
//       }
//     }

//     houseProfit += gameOver ? betAmount : -roundProfit;
//     playerProfit += gameOver ? -betAmount : roundProfit;
//   }

//   return {
//     houseProfit: houseProfit / simulations,
//     playerProfit: playerProfit / simulations,
//   };
// }

//  Example usage
// const totalFields = 25;
// const mines = 3;
// const houseMultiplier = 0.97;
// const rounds = generatePayoutMultipliers(totalFields, mines, houseMultiplier);
// console.log("Payout Multipliers:", rounds);
// const results = simulateGame(totalFields, mines, houseMultiplier, rounds);
// console.log("Average House Profit per Game:", results.houseProfit);
// console.log("Average Player Profit per Game:", results.playerProfit);

export { typeDefs, resolvers };
