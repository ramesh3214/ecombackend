import express from "express";
import { getCoupons } from "../controller/couponController.js";

const router = express.Router();

router.get("/coupon", getCoupons);

export default router;
