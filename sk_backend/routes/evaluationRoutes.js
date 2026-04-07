const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { evaluateProject, getAverageScore, getProjectEvaluation } =
  require("../controllers/evaluationController");

const Project = require("../models/Project");
const Evaluation = require("../models/Evaluation");

/* Existing routes */
router.get("/project/:projectId", protect, getProjectEvaluation);
router.post("/evaluate", protect, evaluateProject);
router.get("/average-score", protect, getAverageScore);

/* User projects with evaluations */
router.get("/user-with-evals", protect, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).lean();
    const evaluations = await Evaluation.find({ userId: req.user._id }).lean();

    const result = projects.map(project => {
      const evalObj = evaluations.find(
        e => String(e.projectId) === String(project._id)
      );

      return {
        ...project,
        finalScore: evalObj ? evalObj.finalScore : null,
        suspicious: evalObj ? evalObj.suspicious : false
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;