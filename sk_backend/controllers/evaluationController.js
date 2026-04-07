const axios = require("axios");
const OpenAI = require("openai");
const Project = require("../models/Project");
const Evaluation = require("../models/Evaluation");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const headers = process.env.GITHUB_TOKEN
  ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
  : {};

/* -----------------------------------------
   🔹 AI HELPER
----------------------------------------- */
const codeEval = async (prompt) => {
  try {
    const aiResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "Return only a number." },
        { role: "user", content: prompt }
      ]
    });
    const match = aiResp.choices[0].message.content.match(/\d+/);
    return match ? Number(match[0]) : 0;
  } catch {
    return 0;
  }
};

/* -----------------------------------------
   🔹 GET DEFAULT BRANCH
----------------------------------------- */
async function getDefaultBranch(repoPath) {
  const repoMeta = await axios.get(`https://api.github.com/repos/${repoPath}`, { headers });
  return repoMeta.data.default_branch;
}

/* -----------------------------------------
   🔹 FETCH CODE
----------------------------------------- */
async function getRepoCode(repoPath, branch) {
  try {
    const tree = await axios.get(
      `https://api.github.com/repos/${repoPath}/git/trees/${branch}?recursive=1`,
      { headers }
    );

    const codeFiles = tree.data.tree
      .filter(f => /\.(js|ts|py|java|cpp)$/.test(f.path))
      .slice(0, 10);

    let code = "";
    for (let file of codeFiles) {
      try {
        const res = await axios.get(
          `https://raw.githubusercontent.com/${repoPath}/${branch}/${file.path}`
        );
        code += `\n\nFILE: ${file.path}\n${res.data}`;
      } catch { }
    }
    return code.slice(0, 15000);
  } catch {
    return "";
  }
}

/* -----------------------------------------
   🔹 STRUCTURE SCORE
----------------------------------------- */
async function getStructureScore(repoPath, branch) {
  try {
    const tree = await axios.get(
      `https://api.github.com/repos/${repoPath}/git/trees/${branch}?recursive=1`,
      { headers }
    );

    const paths = tree.data.tree.map(f => f.path.toLowerCase());
    let score = 0;

    if (paths.some(p => p.startsWith("src/"))) score += 5;
    if (paths.some(p => p.includes("test"))) score += 5;
    if (paths.some(p => p.startsWith("docs/"))) score += 3;
    if (paths.some(p => p.includes("config"))) score += 3;
    if (paths.some(p => p.includes("controller") || p.includes("service"))) score += 4;

    return Math.min(score, 20);
  } catch {
    return 5;
  }
}

/* -----------------------------------------
   🚀 EVALUATE PROJECT
----------------------------------------- */
exports.evaluateProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user.id;

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const repoPath = project.repoUrl.replace("https://github.com/", "");
    const branch = await getDefaultBranch(repoPath);

    /* ---------- COMMITS ---------- */
    const commitsRes = await axios.get(
      `https://api.github.com/repos/${repoPath}/commits?per_page=100`,
      { headers }
    );
    const commits = commitsRes.data;

    let commitScore = 0;
    let suspicious = false;

    if (commits.length) {
      const dates = commits.map(c => new Date(c.commit.author.date));
      const first = new Date(Math.min(...dates));
      const last = new Date(Math.max(...dates));
      const monthsActive = Math.max(1, (last - first) / (1000 * 60 * 60 * 24 * 30));
      const commitsPerMonth = commits.length / monthsActive;

      const frequencyPoints =
        commitsPerMonth > 30 ? 10 :
          commitsPerMonth > 15 ? 8 :
            commitsPerMonth > 5 ? 5 : 2;

      const uniqueDays = new Set(dates.map(d => d.toISOString().split("T")[0])).size;
      const spreadPoints = uniqueDays < 3 ? 2 : uniqueDays < 10 ? 5 : 8;
      if (uniqueDays < 2) suspicious = true;

      const messages = commits.map(c => c.commit.message).join("\n");
      const aiCommitScore = await codeEval(`Score commit message clarity 0-5:\n${messages}`);

      commitScore = frequencyPoints + spreadPoints + aiCommitScore;
    }

    /* ---------- REPO META ---------- */
    const repoMeta = (await axios.get(`https://api.github.com/repos/${repoPath}`, { headers })).data;

    const activityScore =
      repoMeta.stargazers_count > 500 ? 10 :
        repoMeta.stargazers_count > 100 ? 8 :
          repoMeta.forks_count > 20 ? 6 :
            repoMeta.open_issues_count > 10 ? 5 : 3;

    /* ---------- CODE ---------- */
    const codeData = await getRepoCode(repoPath, branch);

    const hasComments = (codeData.match(/\/\//g) || []).length > 10;
    const hasFunctions = (codeData.match(/function|=>/g) || []).length > 10;
    const hasClasses = (codeData.match(/class\s/g) || []).length > 2;

    let baseQuality = 10;
    if (hasComments) baseQuality += 5;
    if (hasFunctions) baseQuality += 5;
    if (hasClasses) baseQuality += 5;

    const aiQuality = await codeEval(`Score code cleanliness 0-10:\n${codeData}`);
    const codeQualityScore = Math.min(baseQuality + aiQuality, 25);

    /* ---------- STRUCTURE ---------- */
    const structureScore = await getStructureScore(repoPath, branch);

    /* ---------- LANGUAGE ---------- */
    const langRes = await axios.get(`https://api.github.com/repos/${repoPath}/languages`, { headers });
    const languages = Object.keys(langRes.data);

    let languageScore =
      languages.includes("TypeScript") || languages.includes("Python") || languages.includes("Java") ? 12 :
        languages.length > 1 ? 10 : 6;

    /* ---------- AUTHENTICITY ---------- */
    const contributorsRes = await axios.get(
      `https://api.github.com/repos/${repoPath}/contributors`,
      { headers }
    );

    let authenticityScore =
      contributorsRes.data.length > 5 ? 10 :
        contributorsRes.data.length > 2 ? 7 : 4;

    if (repoMeta.license) authenticityScore += 5;
    if (commitScore < 5) authenticityScore -= 3;

    /* ---------- FINAL ---------- */
    const finalScore =
      commitScore +
      codeQualityScore +
      structureScore +
      languageScore +
      activityScore +
      authenticityScore;

   const evaluation = await Evaluation.findOneAndUpdate(
  { projectId, userId },
  {
    projectId,
    userId,
    commitScore,
    codeQualityScore,
    structureScore,
    languageScore,
    activityScore,
    authenticityScore,
    finalScore,
    suspicious
  },
  { new: true, upsert: true }
);

    res.status(200).json({ message: "Evaluation Complete", evaluation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Evaluation Error", error: error.message });
  }
};

/* -----------------------------------------
   📊 GET AVERAGE SCORE (🔥 THIS FIXES YOUR ERROR)
----------------------------------------- */
exports.getAverageScore = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ userId: req.user.id });
    if (!evaluations.length)
      return res.status(404).json({ message: "No evaluations found" });

    const avg =
      evaluations.reduce((sum, e) => sum + e.finalScore, 0) / evaluations.length;

    res.status(200).json({
      totalProjects: evaluations.length,
      averageScore: avg.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ message: "Error calculating average score" });
  }
};

// Get evaluation for a specific project
exports.getProjectEvaluation = async (req, res) => {
  try {
    const { projectId } = req.params;

    const evaluation = await Evaluation.findOne({
      projectId,
      userId: req.user.id
    });

    res.json(evaluation || null); // if no evaluation yet, return null
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

