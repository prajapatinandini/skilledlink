const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "company"] },

  companyName: String,
  companySize: String,

  credits: { 
    type: Number, 
    default: 0 
  },

  isVerified: { type: Boolean, default: false },

  // Register wale OTP ke liye
  otp: String,
  otpExpiry: Date,

  // 🚀 FORGOT PASSWORD WALE OTP KE LIYE (Yeh add kiya hai) 👇
  resetOtp: String,
  resetOtpExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);