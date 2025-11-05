// lib/db.js
import mongoose from "mongoose";

const url =
  "mongodb+srv://tqmhosain_db_user:bgBg8jPfeVHVEEnf@cluster0.jrog93k.mongodb.net/optivo?retryWrites=true&w=majority";

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