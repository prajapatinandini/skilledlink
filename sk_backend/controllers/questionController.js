const Test = require("../models/Test");
const AptitudeQuestion = require("../models/AptitudeQuestion");
const CodingQuestion = require("../models/CodingQuestion");


// =============================
// 1️⃣ Add Aptitude Question
// =============================
exports.addAptitudeQuestion = async (req, res) => {
  try {
    const { testId } = req.params;
    const { question, options, correctAnswer, marks } = req.body;

    // Check test exists
    const test = await Test.findById(testId);
    if (!test)
      return res.status(404).json({ message: "Test not found" });

    // Check test belongs to logged company
    if (test.company.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (!question || !options || !correctAnswer)
      return res.status(400).json({ message: "All fields required" });

    if (options.length !== 4)
      return res.status(400).json({ message: "Exactly 4 options required" });

    const aptitude = await AptitudeQuestion.create({
      test: testId,
      question,
      options,
      correctAnswer,
      marks: marks || 1
    });

    // Update test counts
    await Test.findByIdAndUpdate(testId, {
      $inc: {
        aptitudeCount: 1,
        totalMarks: marks || 1
      }
    });

    res.status(201).json({
      message: "Aptitude question added",
      aptitude
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getCompanyQuestions = async (req, res) => {
  try {

    // company ke sare tests
    const tests = await Test.find({ company: req.user._id });

    const testIds = tests.map(test => test._id);

    // un tests ke sare aptitude questions
    const questions = await AptitudeQuestion.find({
      test: { $in: testIds }
    });

    res.status(200).json({
      total: questions.length,
      questions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===================================
   ➕ Add Coding Question
=================================== */
exports.addCodingQuestion = async (req, res) => {
  try {
    const { testId } = req.params;

    const {
      title,
      description,
      sampleInput,
      sampleOutput,
      constraints,
      difficulty,
      marks,
      testCases
    } = req.body;

    const test = await Test.findById(testId);

    if (!test)
      return res.status(404).json({ message: "Test not found" });

    // company authorization
    if (test.company.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (!title || !description)
      return res.status(400).json({ message: "Title & description required" });

    if (!testCases || testCases.length === 0)
      return res.status(400).json({ message: "Test cases required" });

    const question = await CodingQuestion.create({
      test: testId,
      title,
      description,
      sampleInput,
      sampleOutput,
      constraints,
      difficulty,
      marks,
      testCases
    });

    await Test.findByIdAndUpdate(testId, {
      $inc: {
        codingCount: 1,
        totalMarks: marks || 10
      }
    });

    res.status(201).json({
      message: "Coding question created",
      question
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===================================
   📥 Get Coding Questions of Test
=================================== */
exports.getCodingQuestions = async (req, res) => {
  try {
    const { testId } = req.params;

    const questions = await CodingQuestion.find({ test: testId });

    res.json({
      total: questions.length,
      questions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===================================
   🔍 Get Single Coding Question
=================================== */
exports.getCodingQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await CodingQuestion.findById(questionId);

    if (!question)
      return res.status(404).json({ message: "Question not found" });

    res.json(question);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===================================
   ✏️ Update Coding Question
=================================== */
exports.updateCodingQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await CodingQuestion.findById(questionId);

    if (!question)
      return res.status(404).json({ message: "Question not found" });

    Object.assign(question, req.body);

    await question.save();

    res.json({
      message: "Question updated",
      question
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===================================
   ❌ Delete Coding Question
=================================== */
exports.deleteCodingQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await CodingQuestion.findById(questionId);

    if (!question)
      return res.status(404).json({ message: "Question not found" });

    await Test.findByIdAndUpdate(question.test, {
      $inc: {
        codingCount: -1,
        totalMarks: -question.marks
      }
    });

    await question.deleteOne();

    res.json({
      message: "Coding question deleted"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};