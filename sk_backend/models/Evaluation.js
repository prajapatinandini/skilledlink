const mongoose = require("mongoose");   

const evaluationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  commitScore: Number,
  codeQualityScore: Number,
  structureScore: Number,
  languageScore: Number,
  activityScore: Number,
  authenticityScore: Number,
  finalScore: Number,

  suspicious: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

evaluationSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Evaluation", evaluationSchema);