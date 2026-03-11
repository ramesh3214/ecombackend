import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../Model/User.js";
import { Otp } from "../Model/Otp.js";
import { Usergoogle } from "../Model/Googleloginuser.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const JWT_SECRET = process.env.JWT;

console.log("secrete key",JWT_SECRET);

// Google OAuth client will be initialized inside googleLogin

// Generate OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ---------------- MAIL TRANSPORTER ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------------- SEND OTP ----------------
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, otp, expiresAt });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({
      error: "Failed to send OTP",
      details: error.message,
    });
  }
};

// ---------------- VERIFY OTP ----------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required.",
      });
    }

    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      return res.status(400).json({
        error: "OTP not found for this email.",
      });
    }

    if (otpData.expiresAt < Date.now()) {
      await Otp.deleteOne({ email });

      return res.status(400).json({
        error: "OTP has expired.",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        error: "Invalid OTP.",
      });
    }

    await Otp.deleteOne({ email });

    res.status(200).json({
      message: "OTP verified successfully.",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to verify OTP.",
    });
  }
};

// ---------------- SIGNUP ----------------
export const signup = async (req, res) => {
  try {
    const { name, email, number, password } = req.body;

    if (!name || !email || !number || !password) {
      return res.status(400).json({
        error: "Name, email, number and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      number,
      password: hashedPassword,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Registration Successful",
      text: `Welcome ${name}! Your registration was successful.`,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Signup failed",
    });
  }
};

// ---------------- SIGNIN ----------------
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ---------------- UPDATE PROFILE ----------------
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({
        error: "At least one field is required",
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ---------------- GOOGLE LOGIN (FIXED) ----------------
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: "Google token missing",
      });
    }

    // Initialize Google OAuth client here
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    console.log(client);
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      requiredAudience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log(ticket.requiredAudience, "token", ticket.idToken);

    const payload = ticket.getPayload();
    console.log("Token requiredAudience:", payload.aud);
    console.log("Backend client ID:", process.env.GOOGLE_CLIENT_ID);

    const { email, name } = payload;

    let user = await Usergoogle.findOne({ email });

    if (!user) {
      user = await Usergoogle.create({
        name,
        email,
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Google login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Google Login Error:", error);

    res.status(500).json({
      error: "Google login failed",
      details: error.message,
    });
  }
};
