import mongoose from "mongoose";

export const connectDB = (url: string = "") => {
  return mongoose.set("strictQuery", false).connect(url);
};
