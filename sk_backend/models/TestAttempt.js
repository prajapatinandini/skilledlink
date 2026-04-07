const mongoose = require("mongoose");

const testAttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
 
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  },
  // 🟢 Test table ab nahi hai, isko optional kar diya gaya hai
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job" 
  },

  // ================= APTITUDE =================
  aptitudeAnswers: [
    {
      // 🟢 YAHAN FIX KIYA HAI: Saari nayi fields add kar di hain
      questionId: { type: mongoose.Schema.Types.ObjectId }, 
      questionText: { type: String },         // 👈 Naya
      options: [{ type: String }],            // 👈 Naya
      correctAnswerIndex: { type: Number },   // 👈 Naya
      chosenAnswerIndex: { type: Number },    // 👈 Naya
      isCorrect: { type: Boolean },
      marksAwarded: { type: Number }
    }
  ],
  aptitudeCleared: { type: Boolean, default: false },
  aptitudeScore: { type: Number, default: 0 }, 

  // ================= CODING =================
  codingAnswers: [
    {
      // 🟢 'ref' hata diya
      questionId: { type: mongoose.Schema.Types.ObjectId }, 
      code: String,
      testCasesPassed: Number, 
      totalTestCases: Number,  
      marksAwarded: Number
    }
  ],
  codingCleared: { type: Boolean, default: false },
  codingTotalMarks: { type: Number, default: 0 },
  codingObtainedMarks: { type: Number, default: 0 },
  codingPercentage: { type: Number, default: 0 },

  // 🚀 ================= NEW: PROJECT SCORES ================= 🚀
  finalScore: { 
    type: Number, 
    default: 0 
  },
  projectScore: { 
    type: Number, 
    default: 0 
  },

  status: {
    type: String,
    enum: ["in-progress", "completed", "In Review", "Hired", "Rejected"],
    default: "in-progress"
  },
  result: {
    type: String,
    enum: ["pass", "fail"],
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("TestAttempt", testAttemptSchema);