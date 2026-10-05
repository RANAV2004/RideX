const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, vehicle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const userData = { name, email, password, phone, role: role || "rider" };
    if (role === "driver" && vehicle) {
      userData.vehicle = vehicle;
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/update-location (drivers update their live location)
router.put("/update-location", auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: { type: "Point", coordinates: [lng, lat] },
    });
    res.json({ message: "Location updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
