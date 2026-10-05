const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    pickup: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    destination: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "en_route", "arrived", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    rideType: {
      type: String,
      enum: ["economy", "comfort", "xl", "luxury"],
      default: "economy",
    },

    fare: {
      baseFare: { type: Number, default: 0 },
      distanceFare: { type: Number, default: 0 },
      timeFare: { type: Number, default: 0 },
      surgeMultiplier: { type: Number, default: 1 },
      total: { type: Number, default: 0 },
    },

    distance: { type: Number, default: 0 }, // in km
    duration: { type: Number, default: 0 }, // in minutes

    otp: { type: String }, // OTP for driver to verify pickup
    paymentMethod: { type: String, enum: ["cash", "card", "wallet"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },

    riderRating: { type: Number, min: 1, max: 5 },
    driverRating: { type: Number, min: 1, max: 5 },

    startTime: { type: Date },
    endTime: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
