require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const rideRoutes = require("./routes/ride");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const setupSocket = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Uber Clone API is running" });
});

// Socket.IO setup
setupSocket(io);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = { app, io };
