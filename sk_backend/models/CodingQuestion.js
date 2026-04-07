const mongoose = require("mongoose");

const codingQuestionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  sampleInput: String,

  sampleOutput: String,

  constraints: String,

  testCases: [
    {
      input: String,
      expectedOutput: String
    }
  ],

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy"
  },

  marks: {
    type: Number,
    default: 10
  }

}, { timestamps: true });

module.exports = mongoose.model("CodingQuestion", codingQuestionSchema);