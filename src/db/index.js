import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log("Database connection successful.\n");
    console.log("Connection instance: ", connectionInstance.connection.host);
  } catch (error) {
    console.error("Database connection failed.", error);
    throw error;
  }
};

export default connectDB;
