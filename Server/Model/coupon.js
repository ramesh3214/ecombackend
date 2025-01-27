import mongoose from "mongoose";
const couponSchema = new mongoose.Schema({
  coupon: [
    {
      name: { type: String, require: true },
      discount: { type: String, require: true },
    },
  ],
});
export const Coupon = mongoose.model("Coupon", couponSchema);
