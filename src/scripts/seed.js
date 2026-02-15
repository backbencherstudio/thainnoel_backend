import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import Schedule from "../models/schedule.model.js";

dotenv.config();

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("❌ Admin user already exists!");
      console.log(`Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Admin credentials - you can modify these
    const adminData = {
      fullName: process.env.ADMIN_FULL_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    };
    if (!adminData.fullName || !adminData.email || !adminData.password) {
      console.log("❌ Admin credentials not found in environment variables");
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create({
      fullName: adminData.fullName,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
    });
    await Schedule.deleteMany({});
    await Schedule.create({});

    console.log("✅ Admin user created successfully!");
    console.log("====================================");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log("====================================");
    console.log("⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seed();
