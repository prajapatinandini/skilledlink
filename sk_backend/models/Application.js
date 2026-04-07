const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyProfile",
    required: true
  },

  githubUrl: String,

  githubScore: {
    type: Number,
    default: 0
  },

  aptitudeScore: {
    type: Number,
    default: 0
  },

  codingScore: {
    type: Number,
    default: 0
  },

  finalScore: {
    type: Number,
    default: 0
  },

  stage: {
    type: String,
    enum: ["github", "aptitude", "coding", "completed"],
    default: "github"
  },

  
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    enum: ["In Review", "Hired", "Rejected"],
    default: "In Review"
  },

  quizScore: Number,
  codingScore: Number,

  appliedAt: {
    type: Date,
    default: Date.now,
  }
},


 { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);