const mongoose = require("mongoose");

// ==========================================
// 🧠 APTITUDE QUIZ SCHEMA
// ==========================================
const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, default: 1 }              
});

// ==========================================
// 💻 CODING SCHEMA
// ==========================================
const codingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },   
  difficulty: { type: String, default: "Medium" },
  marks: { type: Number, default: 10 },
  
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  
  sampleInput: String,
  sampleOutput: String,
  constraints: String
});

// ==========================================
// 🏢 MAIN JOB SCHEMA
// ==========================================
const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Yahan dhyan de: Agar aapka company model 'User' hai toh yahi rehne de
    required: true
  },
  title: { type: String, required: true },
  experience: String,
  salary: String,
  skills: [String],
  languages: [String],
  daysLeft: Number, // Ise aap UI me manually use kar rahe the shayad
  description: String,

  // 👇 Manual Pause/Resume ke liye 👇
  isPaused: {
    type: Boolean,
    default: false
  },

  // 🚀 👇 NAYA: 30-Day Auto Expiry System ke liye 👇 🚀
  expiresAt: {
    type: Date, // Yahan 30 din aage ki date save hogi
  },
  isExpired: {
    type: Boolean,
    default: false // 30 din baad auto-timer isko true kar dega
  },

  // Embedded Questions
  quiz: [quizSchema],
  coding: [codingSchema],

}, { 
  timestamps: true 
});

module.exports = mongoose.model("Job", jobSchema);