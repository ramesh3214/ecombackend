import { Coupon } from "../Model/coupon.js";

export const getCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupon data" });
  }
};
