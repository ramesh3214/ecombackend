import express from "express";
import { createOrder, getOrders } from "../controller/orderController.js";

const router = express.Router();

router.post("/order", createOrder);
router.get("/orderdata", getOrders);

export default router;
