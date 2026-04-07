const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyProfile", required: true },
  testName: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  languages: { type: [String], required: true },
  aptitudeCount: { type: Number, default: 0 },
  codingCount: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  passingMarks: { type: Number },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true },
  aptitudePdf: { type: String }, // uploaded aptitude PDF
  codingPdf: { type: String },   // uploaded coding PDF
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Test", testSchema);