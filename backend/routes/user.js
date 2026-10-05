const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth, requireDriver } = require("../middleware/auth");

// GET /api/users/profile
router.get("/profile", auth, async (req, res) => {
  res.json(req.user);
});

// PUT /api/users/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, vehicle } = req.body;
    const updates = { name, phone };
    if (req.user.role === "driver" && vehicle) updates.vehicle = vehicle;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/availability (driver toggle)
router.put("/availability", auth, requireDriver, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isAvailable },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/nearby-drivers
router.get("/nearby-drivers", auth, async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

    const drivers = await User.find({
      role: "driver",
      isAvailable: true,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    }).select("name avatar rating vehicle currentLocation");

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
