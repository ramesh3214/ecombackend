import express from "express";
import {
  sendOtp,
  verifyOtp,
  signup,
  signin,
  updateProfile,
  googleLogin

} from "../controller/userController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/signin", signin);
router.put("/update-profile", updateProfile);
router.post("/google-login",googleLogin);

export default router;
