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
