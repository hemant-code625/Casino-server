import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
