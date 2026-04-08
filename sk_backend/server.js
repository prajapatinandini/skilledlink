require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const cron = require("node-cron");

const Job = require("./models/Job"); 

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// 🚀 ================= 100% CRASH-PROOF CUSTOM CORS ================= 🚀
app.use((req, res, next) => {
  // Jo bhi frontend request bhejega, backend usko automatically allow kar dega
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");

  // Agar browser preflight (OPTIONS) check karta hai, toh usko turant Success bhej do (Bina route crash kiye)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// ✅ TEST ROUTE (Yeh zinda hai check karne ke liye)
app.get("/", (req, res) => {
  res.send("🚀 Backend is Running Perfectly with Custom CORS!");
});

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

// 🚀 ================= CRON JOB ================= 🚀
cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    const expiredJobs = await Job.find({
      expiresAt: { $lt: today }, 
      isExpired: false 
    });

    if (expiredJobs.length > 0) {
      console.log(`⏳ Auto-Pausing ${expiredJobs.length} expired jobs...`);
      for (let job of expiredJobs) {
        job.isPaused = true;
        job.isExpired = true; 
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