const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.setAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;
  if (typeof isAvailable !== "boolean") {
    return res.status(400).json({ success: false, message: "isAvailable must be a boolean" });
  }
  if (isAvailable && !req.user.location?.coordinates?.length) {
    return res.status(400).json({ success: false, message: "Share your location before becoming available" });
  }
  req.user.isAvailable = isAvailable;
  await req.user.save();
  res.json({ success: true, isAvailable: req.user.isAvailable });
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const coordinates = req.body.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length !== 2 ||
      !coordinates.every((n) => Number.isFinite(n)) ||
      coordinates[0] < -180 || coordinates[0] > 180 ||
      coordinates[1] < -90 || coordinates[1] > 90) {
    return res.status(400).json({
      success: false,
      message: "coordinates must be [longitude, latitude] within valid ranges"
    });
  }
  req.user.location = { type: "Point", coordinates };
  await req.user.save();
  res.json({ success: true, location: req.user.location });
});

exports.nearbyDrivers = asyncHandler(async (req, res) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);
  const maxDistance = Math.min(Number(req.query.maxDistance || 5000), 50000);
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return res.status(400).json({ success: false, message: "Valid lng and lat query parameters are required" });
  }
  const drivers = await User.find({
    role: "driver",
    isAvailable: true,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: Math.max(100, maxDistance)
      }
    }
  }).select("name vehicle location").limit(20);
  res.json({ success: true, count: drivers.length, drivers });
});
