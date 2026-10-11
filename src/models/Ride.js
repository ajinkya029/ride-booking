const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  address: { type: String, required: true, trim: true, maxlength: 300 },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: (value) => Array.isArray(value) && value.length === 2 &&
        value.every((n) => Number.isFinite(n)) &&
        value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90,
      message: "Coordinates must be [longitude, latitude]"
    }
  }
}, { _id: false });

const rideSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  pickup: { type: pointSchema, required: true },
  destination: { type: pointSchema, required: true },
  distanceKm: { type: Number, required: true, min: 0.1, max: 1000 },
  durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
  fare: { type: Number, required: true, min: 0 },
  vehicleType: { type: String, enum: ["bike", "auto", "car", "premium"], default: "car" },
  paymentMethod: { type: String, enum: ["cash", "card", "upi"], default: "cash" },
  status: {
    type: String,
    enum: ["requested", "accepted", "in_progress", "completed", "cancelled"],
    default: "requested",
    index: true
  },
  cancellationReason: { type: String, maxlength: 300 },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date
}, { timestamps: true });

rideSchema.index({ createdAt: -1 });
module.exports = mongoose.model("Ride", rideSchema);
