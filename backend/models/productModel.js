import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
    },
    photos: [
      {
        public_id: {
          type: String,
          required: [true, "Please enter public_id for photo"],
        },
        url: {
          type: String,
          required: [true, "Please enter photo URL"],
        },
      },
    ],
    price: {
      type: Number,
      required: [true, "Please enter price"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please enter description"],
    },
    category: {
      type: String,
      required: [true, "Please enter product category"],
      trim: true,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
