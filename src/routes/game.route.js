import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateArray } from "../controllers/game.controller.js";

const router = Router();

router.get("/magic-number", verifyJWT, generateArray);

export default router;
