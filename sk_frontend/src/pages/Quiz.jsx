import React, { useState, useRef, useEffect } from "react";
import "../styles/quiz.css";
import { data } from "../assets/data.js";
import Proctoring from "../components/Proctoring"; 

const API_URL = "https://skilledlink-f4lp.onrender.com";

const Quiz = () => {
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(data[0]);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const [attempted, setAttempted] = useState(0);

  // 🚨 ANTI-CHEAT STATES
  const [proctorWarnings, setProctorWarnings] = useState(0);

  // ⏱️ 20 minutes
  const [timeLeft, setTimeLeft] = useState(1200);

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);

  const option_array = [Option1, Option2, Option3, Option4];

  // 🚨 AI WARNING HANDLER
  const handleCheatWarning = (count, reason) => {
    setProctorWarnings(count);
    alert(`⚠️ QUIZ WARNING (${count}/3): ${reason}`);

    if (count >= 3) {
      alert("🚨 QUIZ TERMINATED: Too many violations. Submitting your score now.");
      setResult(true); // Quiz khatam karke result dikha do
    }
  };

  useEffect(() => {
    if (result) return;

    if (timeLeft === 0) {
      setLock(true);
      setResult(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const formatTime = () => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const checkAns = (e, ans) => {
    if (!lock) {
      setAttempted((prev) => prev + 1);

      if (question.ans === ans) {
        e.target.classList.add("correct");
        setScore((prev) => prev + 1);
      } else {
        e.target.classList.add("wrong");
        option_array[question.ans - 1].current.classList.add("correct");
      }
      setLock(true);
    }
  };

  const next = () => {
    if (!lock) return;

    if (index === data.length - 1) {
      setResult(true);
      return;
    }

    setIndex(index + 1);
    setQuestion(data[index + 1]);
    setLock(false);

    option_array.forEach((option) => {
      option.current.classList.remove("wrong");
      option.current.classList.remove("correct");
    });
  };

  const reset = () => {
    setIndex(0);
    setQuestion(data[0]);
    setScore(0);
    setAttempted(0);
    setLock(false);
    setResult(false);
    setTimeLeft(1200);
    setProctorWarnings(0); // Reset warnings too
  };

  return (
    <div className="quiz-page">
      {/* 🚨 PROCTORING AI COMPONENT (Sirf Quiz chalne par dikhega) */}
      {!result && (
        <Proctoring onCheatWarning={handleCheatWarning} maxWarnings={3} />
      )}

      <div className="round"></div>
      <div className="round-bottom"></div>

      <div className="container">
        <div className="quiz-header">
          <h1>SkilledLink Quiz</h1>
          <div className="timer">⏱ {formatTime()}</div>
        </div>

        <hr />

        {!result ? (
          <>
            <h2>
              {index + 1}. {question.question}
            </h2>

            <ul>
              <li ref={Option1} onClick={(e) => checkAns(e, 1)}>
                {question.option1}
              </li>
              <li ref={Option2} onClick={(e) => checkAns(e, 2)}>
                {question.option2}
              </li>
              <li ref={Option3} onClick={(e) => checkAns(e, 3)}>
                {question.option3}
              </li>
              <li ref={Option4} onClick={(e) => checkAns(e, 4)}>
                {question.option4}
              </li>
            </ul>

            <button onClick={next}>Next</button>
            <div className="index">
              {index + 1} of {data.length} Questions
            </div>
          </>
        ) : (
          <>
            <h2>
              You scored {score} out of {data.length}
            </h2>
            <button onClick={reset}>Restart Quiz</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;