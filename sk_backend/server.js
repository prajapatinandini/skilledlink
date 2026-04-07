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

 // Backend - server.js
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://skilledlink-psi.vercel.app" // 👈 YAHAN APNA ASLI VERCEL LINK DAALIYE (Bina last wale slash '/' ke)
  ], 
  credentials: true
}));
  app.use(express.json());

  // ✅ uploads folder
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // ✅ VERY IMPORTANT — frontend serve karega
  //app.use(express.static(path.join(__dirname, "frontend")));

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
  //app.use("/api/test", require("./routes/testAttemptRoutes"));
  app.use("/api/final-score", require("./routes/finalScoreRoutes"));
  app.use("/api/company", require("./routes/studentRoutes"));
  app.use("/api/jobs", require("./routes/jobRoutes"));
  app.use("/api/assessment",require("./routes/assessmentRoutes"));
  app.use("/api/payment", require("./routes/paymentRoutes")); 
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));

  // 🚀 ================= CRON JOB (AUTO-PAUSE EXPIRED JOBS) ================= 🚀
  // Yeh script roz raat ko 12:00 AM par chalegi (0 0 * * *)
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

  // ✅ Default page (optional)
  // app.get("/", (req, res) => {
  //   res.sendFile(path.join(__dirname, "frontend", "login.html"));
  // });

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });