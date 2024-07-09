import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  generateArray,
  generateMineField,
} from "../controllers/game.controller.js";

// The flow of code will be like:
// client sends response on starting the game and the server will mimic the game logic and send the response back to the client

const router = Router();

router.get("/magic-number", generateArray); // removed verifyJWT for testing
router.get(`/mines/:mineCount`, generateMineField);
export default router;
