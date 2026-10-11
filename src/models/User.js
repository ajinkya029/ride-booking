const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["rider", "driver"], default: "rider" },
  phone: { type: String, trim: true, maxlength: 25 },
  isAvailable: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: undefined }
  },
  vehicle: {
    type: { type: String, enum: ["bike", "auto", "car", "premium"] },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    plateNumber: { type: String, trim: true, uppercase: true }
  }
}, { timestamps: true });

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
