const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema({

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  allowedLanguages: [String],

  evaluationFormula: {
    aptitude: { type: Number, default: 40 },
    coding: { type: Number, default: 40 },
    github: { type: Number, default: 20 }
  },

  minimumGithubScore: Number,
  minimumAptitudeScore: Number,

  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public"
  },

  inviteCode: String,

  antiCheatEnabled: {
    type: Boolean,
    default: true
  },

  maxWarningsAllowed: {
    type: Number,
    default: 3
  }

}, { timestamps: true });

module.exports = mongoose.model("CompanySettings", companySettingsSchema);