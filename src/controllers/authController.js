const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

function createToken(userId) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing from environment");
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "rider", phone, vehicle } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }
  if (!["rider", "driver"].includes(role)) {
    return res.status(400).json({ success: false, message: "Role must be rider or driver" });
  }
  if (role === "driver" && !vehicle?.type) {
    return res.status(400).json({ success: false, message: "Drivers must provide vehicle.type" });
  }
  const user = await User.create({ name, email, password, role, phone, vehicle });
  res.status(201).json({
    success: true,
    token: createToken(user._id),
    user: user.toSafeObject()
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  res.json({ success: true, token: createToken(user._id), user: user.toSafeObject() });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});
