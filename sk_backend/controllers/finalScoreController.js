const GithubScore = require("../models/Evaluation");
const TestAttempt = require("../models/TestAttempt");
const CompanySettings = require("../models/CompanySettings");

exports.getFinalScore = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // ✅ attempt
    const attempt = await TestAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        message: "Test attempt not found",
      });
    }

    // ✅ project score
    const project = await GithubScore.findOne({
      userId: attempt.student,
    });

    // ✅ company settings (direct)
    const companySettings = await CompanySettings.findOne();

    if (!companySettings) {
      return res.status(404).json({
        message: "Company settings not found",
      });
    }

    const formula = companySettings.evaluationFormula;

    // ✅ scores safe
    const aptitudeScore = attempt.aptitudePercentage || 0;
    const codingScore = attempt.codingPercentage || 0;
    const githubScore = project?.finalScore || 0;

    // ✅ final score
    const finalScore =
      (aptitudeScore * formula.aptitude) / 100 +
      (codingScore * formula.coding) / 100 +
      (githubScore * formula.github) / 100;

    res.json({
      aptitudeScore,
      codingScore,
      githubScore,
      finalScore,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};