// lib/db.js
import mongoose from "mongoose";

const url = process.env.MONGODB_URI || "mongodb://localhost:27017/thainnoel";

const db_connect = async () => {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default db_connect;
