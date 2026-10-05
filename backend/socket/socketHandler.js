const User = require("../models/User");

const setupSocket = (io) => {
  const connectedUsers = new Map(); // userId -> socketId

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User authenticates with socket
    socket.on("authenticate", async ({ userId, role }) => {
      connectedUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { socketId: socket.id });
      socket.userId = userId;
      socket.userRole = role;
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} (${role}) authenticated`);
    });

    // Join a ride room
    socket.on("join_ride", ({ rideId }) => {
      socket.join(`ride_${rideId}`);
      console.log(`🚗 Socket ${socket.id} joined ride_${rideId}`);
    });

    // Leave a ride room
    socket.on("leave_ride", ({ rideId }) => {
      socket.leave(`ride_${rideId}`);
    });

    // Driver updates location
    socket.on("update_location", async ({ lat, lng, rideId }) => {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          currentLocation: { type: "Point", coordinates: [lng, lat] },
        });

        // Broadcast to rider in same ride
        if (rideId) {
          io.to(`ride_${rideId}`).emit("driver_location_updated", { lat, lng, driverId: socket.userId });
        }
      }
    });

    // Real-time chat message
    socket.on("send_message", ({ rideId, message }) => {
      io.to(`ride_${rideId}`).emit("new_message", message);
    });

    // Driver goes online/offline
    socket.on("driver_toggle", async ({ isAvailable }) => {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { isAvailable });
        socket.broadcast.emit("driver_status_changed", {
          driverId: socket.userId,
          isAvailable,
        });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, {
          socketId: "",
          isAvailable: false,
        });
        console.log(`❌ User ${socket.userId} disconnected`);
      }
    });
  });

  return io;
};

module.exports = setupSocket;
