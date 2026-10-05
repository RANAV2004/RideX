const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Ride = require("../models/Ride");
const { auth } = require("../middleware/auth");

// Simple rule-based chatbot responses
const getBotResponse = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes("cancel") || msg.includes("ride cancel")) {
    return "To cancel your ride, tap the 'Cancel Ride' button on the ride screen. Note that cancellation fees may apply if the driver has already been dispatched.";
  }
  if (msg.includes("where") && (msg.includes("driver") || msg.includes("car"))) {
    return "You can track your driver's location in real-time on the map screen. The ETA is shown at the top.";
  }
  if (msg.includes("payment") || msg.includes("pay") || msg.includes("charge")) {
    return "Payment is processed automatically after your ride. You can view your receipt in Ride History. We accept cash, card, and wallet payments.";
  }
  if (msg.includes("safety") || msg.includes("emergency") || msg.includes("sos")) {
    return "🚨 For emergencies, use the SOS button on the ride screen to share your trip details with emergency contacts. You can also call 911 directly.";
  }
  if (msg.includes("fare") || msg.includes("price") || msg.includes("cost") || msg.includes("rate")) {
    return "Fares are calculated based on distance, time, and ride type. Economy starts at $2.50 base + $1.20/km. You can see the estimated fare before booking.";
  }
  if (msg.includes("lost") || msg.includes("item") || msg.includes("forgot")) {
    return "If you left an item in the vehicle, go to your ride history and contact the driver through the app. You can also report a lost item via the Help section.";
  }
  if (msg.includes("wait") || msg.includes("late") || msg.includes("eta")) {
    return "Your driver's ETA is shown on the map. Traffic and other factors can affect arrival time. You can contact your driver directly via the chat on the ride screen.";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! 👋 I'm your RideAssist bot. How can I help you today? You can ask me about rides, payments, safety, or anything else!";
  }
  if (msg.includes("receipt") || msg.includes("invoice")) {
    return "Your ride receipts are automatically sent to your registered email. You can also view them in the app under Ride History > Select Ride > View Receipt.";
  }
  if (msg.includes("promo") || msg.includes("discount") || msg.includes("coupon")) {
    return "You can apply promo codes in the app under Account > Promotions. Check our app notifications for the latest offers!";
  }

  return "I'm not sure about that, but I'm here to help! You can ask me about: ride cancellation, payment, driver tracking, lost items, safety, or fares. For complex issues, our support team is available 24/7.";
};

// GET /api/chat/:rideId/messages
router.get("/:rideId/messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({ ride: req.params.rideId })
      .populate("sender", "name avatar role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/chat/:rideId/message
router.post("/:rideId/message", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const message = new Message({
      ride: req.params.rideId,
      sender: req.user._id,
      senderRole: req.user.role,
      content,
    });
    await message.save();
    await message.populate("sender", "name avatar role");

    // Emit via socket
    const io = req.app.get("io");
    if (io) io.to(`ride_${req.params.rideId}`).emit("new_message", message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/chat/bot
router.post("/bot", auth, async (req, res) => {
  try {
    const { message } = req.body;
    const botReply = getBotResponse(message);
    res.json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
