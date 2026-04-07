const TestAttempt = require("../models/TestAttempt");
const Job = require("../models/Job"); // Changed from Test to Job

// ✅ 1. Get Job/Test Details
exports.getTestDetails = async (req, res) => {
  try {
    const { testId: jobId } = req.params; // Treating testId from URL as jobId

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job/Assessment not found" });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 2. Get All Attempts (with filter + pagination)
exports.getTestAttempts = async (req, res) => {
  try {
    const { testId: jobId } = req.params;
    const { result, page = 1, limit = 10 } = req.query;

    const filter = {
      company: jobId, // 🟢 Changed from 'test' to 'company' to match your DB
      status: "completed"
    };

    if (result) {
      filter.result = result; // pass / fail
    }

    const attempts = await TestAttempt.find(filter)
      .populate("student", "name email")
      .sort({ 'codingPercentage': -1, 'aptitudeScore': -1 }) // Sorted by actual score fields
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await TestAttempt.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      attempts
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 3. Get Single Attempt Detail
exports.getAttemptDetail = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId)
      .populate("student", "name email");

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.json(attempt);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 4. Basic Stats 
exports.getTestStats = async (req, res) => {
  try {
    const { testId: jobId } = req.params;

    const attempts = await TestAttempt.find({
      company: jobId, // 🟢 Match DB schema
      status: "completed"
    });

    const totalStudents = attempts.length;

    // Calculate average using the correct logic (Aptitude 50% + Coding 50%)
    const averageScore =
      attempts.reduce((sum, a) => {
        const finalScore = ((a.aptitudeScore || 0) * 0.50) + ((a.codingPercentage || 0) * 0.50);
        return sum + finalScore;
      }, 0) / totalStudents || 0;

    const passCount = attempts.filter(a => a.result === "pass").length;

    res.json({
      totalStudents,
      averageScore: averageScore.toFixed(2),
      passPercentage: totalStudents
        ? ((passCount / totalStudents) * 100).toFixed(2)
        : 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 5. Detailed Stats
exports.getDetailedStats = async (req, res) => {
  try {
    const { testId: jobId } = req.params;

    const attempts = await TestAttempt.find({
      company: jobId, // 🟢 Match DB schema
      status: "completed"
    });

    if (attempts.length === 0) {
      return res.json({ message: "No attempts found", highest: 0, lowest: 0 });
    }

    // Calculate final scores
    const scores = attempts.map(a => ((a.aptitudeScore || 0) * 0.50) + ((a.codingPercentage || 0) * 0.50));

    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    res.json({
      highest: highest.toFixed(2),
      lowest: lowest.toFixed(2)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 6. Chart Data (score distribution)
exports.getChartStats = async (req, res) => {
  try {
    const { testId: jobId } = req.params;

    const attempts = await TestAttempt.find({
      company: jobId, // 🟢 Match DB schema
      status: "completed"
    });

    const buckets = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0
    };

    attempts.forEach(a => {
      const p = ((a.aptitudeScore || 0) * 0.50) + ((a.codingPercentage || 0) * 0.50);

      if (p <= 20) buckets["0-20"]++;
      else if (p <= 40) buckets["21-40"]++;
      else if (p <= 60) buckets["41-60"]++;
      else if (p <= 80) buckets["61-80"]++;
      else buckets["81-100"]++;
    });

    res.json(buckets);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};