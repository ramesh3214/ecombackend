import { Product } from "../Model/Product.js";

export const getProducts = async (req, res) => {
  try {
    const productdata = await Product.find();
    res.status(200).json(productdata);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product data" });
  }
};
