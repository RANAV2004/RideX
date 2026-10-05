const express = require("express");
const router = express.Router();
const Ride = require("../models/Ride");
const User = require("../models/User");
const { auth, requireRider, requireDriver } = require("../middleware/auth");

// Fare calculation utility
const calculateFare = (distanceKm, durationMin, rideType) => {
  const rates = {
    economy:  { base: 2.5, perKm: 1.2, perMin: 0.2 },
    comfort:  { base: 3.5, perKm: 1.8, perMin: 0.3 },
    xl:       { base: 4.5, perKm: 2.2, perMin: 0.35 },
    luxury:   { base: 6.0, perKm: 3.0, perMin: 0.5 },
  };
  const rate = rates[rideType] || rates.economy;
  const baseFare = rate.base;
  const distanceFare = distanceKm * rate.perKm;
  const timeFare = durationMin * rate.perMin;
  const total = parseFloat((baseFare + distanceFare + timeFare).toFixed(2));
  return { baseFare, distanceFare: parseFloat(distanceFare.toFixed(2)), timeFare: parseFloat(timeFare.toFixed(2)), total };
};

// Calculate distance between two coords (Haversine)
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// POST /api/rides/estimate
router.post("/estimate", auth, async (req, res) => {
  try {
    const { pickup, destination } = req.body;
    const distanceKm = getDistance(
      pickup.coordinates.lat, pickup.coordinates.lng,
      destination.coordinates.lat, destination.coordinates.lng
    );
    const durationMin = Math.round((distanceKm / 30) * 60); // avg 30km/h

    const estimates = ["economy", "comfort", "xl", "luxury"].map((type) => ({
      type,
      ...calculateFare(distanceKm, durationMin, type),
      distance: parseFloat(distanceKm.toFixed(2)),
      duration: durationMin,
      eta: `${Math.max(2, Math.round(Math.random() * 5 + 2))} min`,
    }));

    res.json({ estimates, distanceKm: parseFloat(distanceKm.toFixed(2)), durationMin });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/rides/request
router.post("/request", auth, requireRider, async (req, res) => {
  try {
    const { pickup, destination, rideType, paymentMethod } = req.body;

    const distanceKm = getDistance(
      pickup.coordinates.lat, pickup.coordinates.lng,
      destination.coordinates.lat, destination.coordinates.lng
    );
    const durationMin = Math.round((distanceKm / 30) * 60);
    const fare = calculateFare(distanceKm, durationMin, rideType || "economy");

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const ride = new Ride({
      rider: req.user._id,
      pickup,
      destination,
      rideType: rideType || "economy",
      fare,
      distance: parseFloat(distanceKm.toFixed(2)),
      duration: durationMin,
      paymentMethod: paymentMethod || "cash",
      otp,
    });

    await ride.save();
    await ride.populate("rider", "name phone avatar rating");

    // Emit to all available drivers via socket (handled in socketHandler)
    const io = req.app.get("io");
    if (io) {
      io.emit("new_ride_request", ride);
    }

    res.status(201).json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/rides/my-rides
router.get("/my-rides", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "rider"
        ? { rider: req.user._id }
        : { driver: req.user._id };

    const rides = await Ride.find(query)
      .populate("rider", "name avatar rating")
      .populate("driver", "name avatar rating vehicle")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/rides/active
router.get("/active", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "rider"
        ? { rider: req.user._id, status: { $in: ["pending", "accepted", "en_route", "arrived", "in_progress"] } }
        : { driver: req.user._id, status: { $in: ["accepted", "en_route", "arrived", "in_progress"] } };

    const ride = await Ride.findOne(query)
      .populate("rider", "name phone avatar rating")
      .populate("driver", "name phone avatar rating vehicle currentLocation");

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/rides/pending (for drivers)
router.get("/pending", auth, requireDriver, async (req, res) => {
  try {
    const rides = await Ride.find({ status: "pending" })
      .populate("rider", "name avatar rating")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/rides/:id/accept
router.put("/:id/accept", auth, requireDriver, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "pending") return res.status(400).json({ message: "Ride already accepted" });

    ride.driver = req.user._id;
    ride.status = "accepted";
    await ride.save();
    await ride.populate(["rider", "driver"]);

    const io = req.app.get("io");
    if (io) io.to(`ride_${ride._id}`).emit("ride_accepted", ride);

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/rides/:id/status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = status;
    if (status === "in_progress") ride.startTime = new Date();
    if (status === "completed") {
      ride.endTime = new Date();
      ride.paymentStatus = "paid";
      await User.findByIdAndUpdate(ride.driver, {
        $inc: { totalRides: 1, earnings: ride.fare.total },
      });
      await User.findByIdAndUpdate(ride.rider, {
        $inc: { totalRides: 1 },
      });
    }

    await ride.save();
    await ride.populate(["rider", "driver"]);

    const io = req.app.get("io");
    if (io) io.to(`ride_${ride._id}`).emit("ride_status_updated", ride);

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/rides/:id/cancel
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = "cancelled";
    await ride.save();

    const io = req.app.get("io");
    if (io) io.to(`ride_${ride._id}`).emit("ride_cancelled", ride);

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/rides/:id/rate
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (req.user.role === "rider") {
      ride.driverRating = rating;
      const driver = await User.findById(ride.driver);
      driver.rating = parseFloat(((driver.rating + rating) / 2).toFixed(1));
      await driver.save();
    } else {
      ride.riderRating = rating;
    }

    await ride.save();
    res.json({ message: "Rating submitted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
