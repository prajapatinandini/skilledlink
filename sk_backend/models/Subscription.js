const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  },

  plan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free"
  },

  maxTestsAllowed: {
    type: Number,
    default: 3
  },

  maxStudentsPerTest: {
    type: Number,
    default: 100
  },

  expiresAt: Date,

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);