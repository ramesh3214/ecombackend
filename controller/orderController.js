import { Order } from "../Model/order.js";

export const createOrder = async (req, res) => {
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
    const newOrder = new Order({
      email,
      orderNumber,
      totalPrice,
      quantity,
      name,
      selectedsize,
      selectedcolor,
    });
    const savedOrder = await newOrder.save();
    res
      .status(201)
      .json({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Order number already exists." });
    }
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orderdata = await Order.find();
    res.status(200).json(orderdata);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order data" });
  }
};
