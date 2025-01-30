import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true }, // Example categories
  gender: { type: String, required: true },
  images: [
    {
      src: { type: String, required: true },
      alt: { type: String, required: true },
    },
  ],
  price: { type: Number, required: true, min: 0 }, // Changed to Number for calculations
  quantity: { type: Number, required: true, min: 0 }, // Total stock quantity
  sizes: [
    {
      size: { type: String, required: true },
      quantity: { type: Number, required: true, min: 0 }, // Track stock for each size
    },
  ],
  colors: [
    {
      color: { 
        type: String, 
        required: true, 
        trim: true 
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: 0 
      },
      isAvailable: {
        type: Boolean,
        required: true,
        default: function() {
          return this.quantity > 0;
        },
      },
    }
  ],
  description: { type: String, required: true, trim: true },
  highlights: [{ type: String, trim: true }],
});

// Middleware to check and disable sizes with 0 stock
productSchema.methods.isSizeAvailable = function (size) {
  const sizeData = this.sizes.find((s) => s.size === size);
  return sizeData ? sizeData.quantity > 0 : false;
};

export const Product = mongoose.model("Product", productSchema);
