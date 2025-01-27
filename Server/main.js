// Import dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Product } from "../Model/Product.js";
import { Coupon } from "../Model/coupon.js";
import { Contact } from "../Model/contact.js";
import { Order } from "../Model/order.js";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

// App initialization
const app = express();
const PORT = process.env.PORT;
const JWT_SECRET= "jwt_123";

// Middleware setup
app.use(
  cors({
    origin: "*", // You can specify specific origins if needed
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // Parse JSON requests

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI, {}
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit the app on failure to connect
  });

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"
  if (!token) {
    return res.status(403).json({ error: "Access denied. Token missing." });
  }
  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded; // Attach decoded token data to `req.user`
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Test Route
app.get("/api", (req, res) => {
  res.json({ message: "Server is working" });
});

// User Signup Route
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Define OTP Schema and Model
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const Otp = mongoose.model("Otp", otpSchema);

// Set up Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.User_email, // Your email address
    pass: process.env.Password, // Your email password or app password
  },
});

// Generate OTP Function
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Routes

// 1. Send OTP
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Generate OTP and save it in the database
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    await Otp.create({ email, otp, expiresAt });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

// 2. Verify OTP
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      return res.status(400).json({ error: "OTP not found for this email." });
    }

    if (otpData.expiresAt < Date.now()) {
      await Otp.deleteOne({ email }); // Remove expired OTP
      return res.status(400).json({ error: "OTP has expired." });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    await Otp.deleteOne({ email }); // Remove OTP after successful verification
    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ error: "Failed to verify OTP." });
  }
});

// 3. Signup (Register User)
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Registration Successful",
      text: `Welcome to our platform, ${name}! You have successfully registered.`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({
        message: "User registered successfully. Confirmation email sent.",
      });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ error: "Signup failed." });
  }
});

// 4. Signin (Login User)
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Signin successful.", token });
  } catch (error) {
    console.error("Signin error:", error.message);
    res.status(500).json({ error: "Signin failed." });
  }
});

// Fetch Products Route
app.get("/product", async (req, res) => {
  try {
    const productdata = await Product.find(); // Awaiting the result of Product.find()
    res.status(200).json(productdata); // Sending the data as JSON response
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ message: "Failed to fetch product data" });
  }
});

// Update Profile Route
app.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Ensure at least one field to update
    if (!name && !email) {
      return res.status(400).json({ error: "At least one field is required." });
    }

    // Prepare updates
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/coupon", async (req, res) => {
  try {
    const coupon = await Coupon.find();
    res.status(200).json(coupon);
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ message: "Failed to fetch coupn data" });
  }
});

app.post("/contact", async (req, res) => {
  try {
    const { email, name, message } = req.body;
    const newContact = new Contact({ email, name, message });
    await newContact.save();
    res.status(200).send({ message: "Contact saved successfully!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "An error occurred while saving the contact." });
  }
});
app.post("/order", async (req, res) => {
  const {
    email,
    orderNumber,
    totalPrice,
    quantity,
    name,
    selectedsize,
    selectedcolor,
  } = req.body;

  try {
    // Validate required fields
    if (
      !email ||
      !orderNumber ||
      !totalPrice ||
      !quantity ||
      !name ||
      !selectedsize ||
      !selectedcolor
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new order
    const newOrder = new Order({
      email,
      orderNumber,
      totalPrice,
      quantity,
      name,
      selectedsize,
      selectedcolor,
    });

    // Save order to the database
    const savedOrder = await newOrder.save();

    // Return success response
    res
      .status(201)
      .json({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    // Handle duplicate order number
    if (error.code === 11000) {
      return res.status(400).json({ message: "Order number already exists." });
    }

    // Handle other errors
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
});
app.get("/orderdata", async (req, res) => {
  try {
    const orderdata = await Order.find();
    res.status(200).json(orderdata);
  } catch (error) {
    console.error("Error fetching order data:", error);
    res.status(500).json({ message: "Failed to fetch order data" });
  }
});
// Start the Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
