import ApiResponse from "../utils/ApiResponse.js";

export const generateArray = (req, res) => {
  let numbers = [];
  while (numbers.length < 9) {
    const randomNumber = Math.floor(Math.random() * 9) + 1;
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }
  return res.status(200).json(new ApiResponse(200, "Array generated", numbers));
};

export const generateMineField = (req, res) => {
  const mineCount = req.params.mineCount;
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
  return res
    .status(200)
    .json(new ApiResponse(200, "Mine field generated", mineField));
};
