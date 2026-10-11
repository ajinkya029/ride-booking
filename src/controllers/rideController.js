const Ride = require("../models/Ride");
const asyncHandler = require("../utils/asyncHandler");
const estimateFare = require("../utils/fare");

const allowedVehicles = ["bike", "auto", "car", "premium"];
const allowedPayments = ["cash", "card", "upi"];

function validPoint(point) {
  return point && typeof point.address === "string" && point.address.trim() &&
    Array.isArray(point.coordinates) && point.coordinates.length === 2 &&
    point.coordinates.every(Number.isFinite) &&
    point.coordinates[0] >= -180 && point.coordinates[0] <= 180 &&
    point.coordinates[1] >= -90 && point.coordinates[1] <= 90;
}

exports.estimate = asyncHandler(async (req, res) => {
  const { distanceKm, durationMinutes } = req.body;
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 ||
      !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return res.status(400).json({ success: false, message: "Positive distanceKm and durationMinutes are required" });
  }
  res.json({
    success: true,
    currency: "INR",
    fare: estimateFare(distanceKm, durationMinutes),
    breakdown: {
      baseFare: Number(process.env.BASE_FARE || 40),
      distanceCharge: Math.round(distanceKm * Number(process.env.PRICE_PER_KM || 12) * 100) / 100,
      timeCharge: Math.round(durationMinutes * Number(process.env.PRICE_PER_MINUTE || 1.5) * 100) / 100
    }
  });
});

exports.createRide = asyncHandler(async (req, res) => {
  const { pickup, destination, distanceKm, durationMinutes, vehicleType = "car", paymentMethod = "cash" } = req.body;
  if (!validPoint(pickup) || !validPoint(destination)) {
    return res.status(400).json({ success: false, message: "Pickup and destination require an address and [longitude, latitude] coordinates" });
  }
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 1000 ||
      !Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 1440) {
    return res.status(400).json({ success: false, message: "Valid distanceKm and durationMinutes are required" });
  }
  if (!allowedVehicles.includes(vehicleType) || !allowedPayments.includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Invalid vehicleType or paymentMethod" });
  }
  const ride = await Ride.create({
    rider: req.user._id, pickup, destination, distanceKm, durationMinutes,
    vehicleType, paymentMethod, fare: estimateFare(distanceKm, durationMinutes)
  });
  await ride.populate("rider", "name phone");
  res.status(201).json({ success: true, ride });
});

exports.myRides = asyncHandler(async (req, res) => {
  const filter = req.user.role === "rider" ? { rider: req.user._id } : { driver: req.user._id };
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  if (req.query.status) filter.status = req.query.status;
  const [rides, total] = await Promise.all([
    Ride.find(filter).populate("rider", "name phone").populate("driver", "name phone vehicle")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Ride.countDocuments(filter)
  ]);
  res.json({ success: true, rides, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.getRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id)
    .populate("rider", "name phone")
    .populate("driver", "name phone vehicle");
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });
  const isRider = ride.rider._id.equals(req.user._id);
  const isDriver = ride.driver && ride.driver._id.equals(req.user._id);
  if (!isRider && !isDriver) return res.status(403).json({ success: false, message: "You are not a participant in this ride" });
  res.json({ success: true, ride });
});

exports.acceptRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.id, status: "requested", driver: null, vehicleType: req.user.vehicle?.type },
    { $set: { status: "accepted", driver: req.user._id, acceptedAt: new Date() } },
    { new: true, runValidators: true }
  ).populate("rider", "name phone").populate("driver", "name phone vehicle");
  if (!ride) return res.status(409).json({ success: false, message: "Ride is unavailable, already assigned, or does not match your vehicle type" });
  req.user.isAvailable = false;
  await req.user.save();
  res.json({ success: true, ride });
});

exports.startRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.id, driver: req.user._id, status: "accepted" },
    { $set: { status: "in_progress", startedAt: new Date() } },
    { new: true, runValidators: true }
  );
  if (!ride) return res.status(409).json({ success: false, message: "Only the assigned driver can start an accepted ride" });
  res.json({ success: true, ride });
});

exports.completeRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.id, driver: req.user._id, status: "in_progress" },
    { $set: { status: "completed", completedAt: new Date() } },
    { new: true, runValidators: true }
  );
  if (!ride) return res.status(409).json({ success: false, message: "Only the assigned driver can complete an in-progress ride" });
  req.user.isAvailable = false;
  await req.user.save();
  res.json({ success: true, ride });
});

exports.cancelRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });
  const isRider = ride.rider.equals(req.user._id);
  const isAssignedDriver = ride.driver && ride.driver.equals(req.user._id);
  if (!isRider && !isAssignedDriver) return res.status(403).json({ success: false, message: "You are not a participant in this ride" });
  if (!["requested", "accepted"].includes(ride.status)) {
    return res.status(409).json({ success: false, message: "Only requested or accepted rides can be cancelled" });
  }
  ride.status = "cancelled";
  ride.cancelledAt = new Date();
  ride.cancellationReason = String(req.body.reason || "").slice(0, 300);
  await ride.save();
  res.json({ success: true, ride });
});
