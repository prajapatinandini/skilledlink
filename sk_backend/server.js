require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");

const Job = require("./models/Job"); 

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// 🚀 ================= BULLETPROOF CORS SETUP ================= 🚀
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://skilledlink-psi.vercel.app" 
  ], 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Har tarah ki request allow kar di
  allowedHeaders: ["Content-Type", "Authorization"], // Authorization (Token) allow kar diya
  credentials: true,
  optionsSuccessStatus: 200 // Kuch browsers ke liye extra safety
}));

app.use(express.json());

// ✅ uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/student", require("./routes/studentprofileRoutes"));
app.use("/api/application", require("./routes/applicationRoutes"));
app.use("/api/evaluation", require("./routes/evaluationRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/company/dashboard", require("./routes/companyDashboardRoutes"));
app.use("/api/final-score", require("./routes/finalScoreRoutes"));
app.use("/api/company", require("./routes/studentRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/assessment", require("./routes/assessmentRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes")); 
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 🚀 ================= CRON JOB (AUTO-PAUSE EXPIRED JOBS) ================= 🚀
cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    
    // Wo saari jobs dhundho jinki expiry date nikal chuki hai, par wo abhi tak expire mark nahi hui
    const expiredJobs = await Job.find({
      expiresAt: { $lt: today }, 
      isExpired: false 
    });

    if (expiredJobs.length > 0) {
      console.log(`⏳ Auto-Pausing ${expiredJobs.length} expired jobs...`);
      
      for (let job of expiredJobs) {
        job.isPaused = true;
        job.isExpired = true; // UI pe status dikhane ke kaam aayega
        await job.save();
      }
      console.log('✅ Auto-Pause complete!');
    }
  } catch (error) {
    console.error('🔥 Error in Cron Job:', error);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});