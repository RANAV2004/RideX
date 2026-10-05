const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["rider", "driver"], default: "rider" },
    avatar: { type: String, default: "" },

    // Driver specific
    vehicle: {
      make: String,
      model: String,
      year: Number,
      licensePlate: String,
      color: String,
    },
    isAvailable: { type: Boolean, default: false }, // for drivers
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalRides: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },

    // Live location (drivers)
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    socketId: { type: String, default: "" },
  },
  { timestamps: true }
);

// Geo index for location-based queries
userSchema.index({ currentLocation: "2dsphere" });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
