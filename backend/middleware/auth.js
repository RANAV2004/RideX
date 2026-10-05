const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireDriver = (req, res, next) => {
  if (req.user.role !== "driver") {
    return res.status(403).json({ message: "Driver access required" });
  }
  next();
};

const requireRider = (req, res, next) => {
  if (req.user.role !== "rider") {
    return res.status(403).json({ message: "Rider access required" });
  }
  next();
};

module.exports = { auth, requireDriver, requireRider };
