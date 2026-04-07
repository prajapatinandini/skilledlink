const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, projectController.addProject);
router.get("/:userId", protect, projectController.getUserProjects);
router.delete("/:projectId", protect, projectController.deleteProject);
router.post("/add-multiple", protect, projectController.addMultipleProjects);

module.exports = router;
