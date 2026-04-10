const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Job", 
    required: true // 👈 Naya Field Add Kiya
  },
  title: { type: String, required: true },
  repoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Ab Duplicate check teeno cheezon pe hoga: (User + Job + URL)
projectSchema.index({ userId: 1, jobId: 1, repoUrl: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);