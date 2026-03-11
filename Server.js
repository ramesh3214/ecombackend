import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import Dbconnection from "./Db/Dbconnection.js";

import userRouter from "./router/userRouter.js";
import productRouter from "./router/productRouter.js";
import couponRouter from "./router/couponRouter.js";
import contactRouter from "./router/contactRouter.js";
import orderRouter from "./router/orderRouter.js";
import paymentroute from "./router/PaymentRoute.js";
process.env.PORT = process.env.PORT || "8080";

const app = express();
const PORT = process.env.PORT;

console.log(PORT);



app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});


// CORS configuration
app.use(
  cors({
    origin: "https://elegant-dolphin-85cb1e.netlify.app", // React frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// Middleware
app.use(express.json());


// Database connection
Dbconnection();


// Test route
app.get("/api", (req, res) => {
  res.json({ message: "Server is working" });
});


// Routes
app.use("/", userRouter);
app.use("/", productRouter);
app.use("/", couponRouter);
app.use("/", contactRouter);
app.use("/", orderRouter);
app.use("/", paymentroute);


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
