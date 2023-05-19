import { Schema, model, Document } from "mongoose";

interface IProduct {
  _id: Schema.Types.ObjectId;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  company: string;
  colors: string[];
  featured?: boolean;
  freeShipping?: boolean;
  inventory: number;
  averageRating: number;
  numberOfReviews: number;
  user: Schema.Types.ObjectId;
}

const ProductSchema = new Schema<Required<IProduct>>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Pleae provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    image: { type: String, default: "/uploads/example.jpeg" },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please provide company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: { type: [String], required: true, default: ["#222"] },
    featured: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    inventory: { type: Number, required: true, default: 15 },
    averageRating: { type: Number, default: 0 },
    numberOfReviews: { type: Number, default: 0 },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//You need to set this up to add properties to a model that arent present in the schema definition, for example all the reviews ofr a product
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id", // the property in the product schema that links with the review model
  foreignField: "product", // the property in the review model
  justOne: false,
  //match: {rating: 5};
});

//You do this because this in the remove function is not referencing the Document object
ProductSchema.pre("remove", async function () {
  const doc = this as any as Document<IProduct>;
  await model("Review").deleteMany({ product: doc._id });
});

export const Product = model<Required<IProduct>>("Product", ProductSchema);
