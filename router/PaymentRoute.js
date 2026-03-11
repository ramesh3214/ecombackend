import express from "express";
const router = express.Router();

import { createpayment, paymentSuccessHandler } from "../controller/paymentgetway.js";

router.post("/create-payment", createpayment);

// Cashfree will redirect to this URL after payment
router.get("/payment-success", paymentSuccessHandler);

export default router;