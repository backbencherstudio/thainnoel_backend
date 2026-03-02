import User from "../models/user.model.js";
import catchAsync from "../lib/catchAsync.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/email.service.js";
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  // 2. Find User
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // 3. check Role (Only admin can login for now as per user request)
  if (user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access restricted: Only admins can login at this time",
    });
  }

  // 4. Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // 5. Generate Token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "10d" },
  );

  // 6. Send Response
  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { fullName, oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (fullName) user.fullName = fullName;
  if (oldPassword && newPassword) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

const forgotPasswordRequest = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  // send otp to user email
  await sendEmail(user.email, "Forgot Password", `Your OTP is ${otp}`);
  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  if (user.otp !== otp.toString()) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP",
    });
  }
  if (user.otpExpiry < Date.now()) {
    return res.status(401).json({
      success: false,
      message: "OTP expired",
    });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

export { login, updateProfile, forgotPasswordRequest, resetPassword };
