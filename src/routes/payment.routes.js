import { Router } from "express";
import {
  createOrder,
  createPayout,
  isBankAccountAdded,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/verify-bank-details", verifyJWT, isBankAccountAdded);
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyJWT, verifyPayment);
router.post("/withdraw", createPayout);

export default router;
