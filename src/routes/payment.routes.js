import { Router } from "express";
import {
  createOrder,
  createPayout,
  verifyPayment,
} from "../controllers/payment.controller.js";
const router = Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/withdraw", createPayout);

export default router;
