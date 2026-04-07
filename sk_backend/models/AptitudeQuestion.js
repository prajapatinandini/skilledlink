const mongoose = require("mongoose");

function arrayLimit(val) {
  return val.length === 4;
}

const aptitudeQuestionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },

  question: {
    type: String,
    required: true,
    trim: true
  },

  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, "Exactly 4 options required"]
  },

  correctAnswer: {
    type: String,
    required: true
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy"
  },

  marks: {
    type: Number,
    default: 1
  },
  testCases: [
  {
    input: String,        // "2,3"
    expectedOutput: String // "5"
  }
]

}, { timestamps: true });

module.exports = mongoose.model("AptitudeQuestion", aptitudeQuestionSchema);