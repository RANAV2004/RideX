const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["rider", "driver", "bot"], required: true },
    content: { type: String, required: true },
    messageType: { type: String, enum: ["text", "bot"], default: "text" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
