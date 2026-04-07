const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: { type: String, required: true },
  repoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Only same user + same repoUrl duplicate block kare
projectSchema.index({ userId: 1, repoUrl: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);