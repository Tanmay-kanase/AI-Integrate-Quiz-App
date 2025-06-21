import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};
