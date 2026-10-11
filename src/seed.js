require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in .env first");
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({ email: { $in: ["rider@example.com", "driver@example.com"] } });

  await User.create([
    { name: "Demo Rider", email: "rider@example.com", password: "Rider123!", role: "rider" },
    {
      name: "Demo Driver", email: "driver@example.com", password: "Driver123!", role: "driver",
      isAvailable: true, location: { type: "Point", coordinates: [72.8777, 19.0760] },
      vehicle: { type: "car", make: "Hyundai", model: "i20", plateNumber: "MH01AB1234" }
    }
  ]);
  console.log("Seed complete. Demo accounts: rider@example.com / Rider123! and driver@example.com / Driver123!");
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
