import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  gender: { type: String, required: true },
  images: [
    {
      src: { type: String, required: true },
      alt: { type: String, required: true },
    },
  ],
  price: { type: String, required: true },
  size: [String],
  colors: [String],
  description: { type: String, required: true },
  highlights: [String],
});

export const Product = mongoose.model("Product", productSchema);
