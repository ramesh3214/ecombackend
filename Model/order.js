import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    selectedsize: {
      type: String,
      required: true,
    },
    selectedcolor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` timestamps
  }
);



export  const Order = mongoose.model("Order", orderSchema);
