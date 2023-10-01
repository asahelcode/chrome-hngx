import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

export const connectDB = async (uri) => {
  return await connect(uri);
};
