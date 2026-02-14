import User from "../models/user.model.js";
import catchAsync from "../lib/catchAsync.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

export { login };
