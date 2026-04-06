// utils/helpers.js

import { QUIZ_QS, CODING_QS } from '../data/constants';

export const makeQuiz = () => Array.from({ length: 20 }, () => ({
  question: "",
  options: ["", "", "", ""],
  correct: 0
}));

export const makeCoding = () => Array.from({ length: 3 }, () => ({
  title: "",
  problem: "",
  input: "",
  output: "",
  hint: ""
}));

export const emptyForm = {
  title: "",
  experience: "",
  salary: "",
  description: "",
  skillsInput: "",
  languagesInput: "",
  daysLeft: ""
};

export const buildQuizAnswers = (score) => {
  const nCorrect = Math.round((score / 100) * 20);
  return QUIZ_QS.map((q, i) => {
    const isCorrect = i < nCorrect;
    const chosen = isCorrect ? q.correct : (q.correct + 1 + (i % 3)) % 4;
    return { ...q, chosen, isCorrect };
  });
};

export const buildCodingAnswers = (score) => {
  const passed = score >= 85 ? 3 : score >= 65 ? 2 : 1;
  return CODING_QS.map((q, i) => ({
    ...q,
    passed: i < passed,
    timeTaken: `${12 + i * 7 + (score % 5)}m`,
    studentCode: i < passed
      ? `function solution(input) {\n  // Correct approach\n  return ${q.output};\n}`
      : `function solution(input) {\n  // Incomplete solution\n  return null;\n}`,
  }));
};
