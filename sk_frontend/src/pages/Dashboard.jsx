import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QUIZ_QS = [
  { q: "What does HTML stand for?", options: ["HyperText Markup Language","HighText Machine Language","HyperText Machine Language","Hyper Transfer Markup Language"], correct: 0 },
  { q: "Which CSS property controls text size?", options: ["font-weight","text-size","font-size","text-style"], correct: 2 },
  { q: "Which hook manages state in React?", options: ["useEffect","useRef","useContext","useState"], correct: 3 },
  { q: "What does API stand for?", options: ["Application Programming Interface","Applied Program Index","App Protocol Interface","Application Process Integration"], correct: 0 },
  { q: "What does REST stand for?", options: ["Remote Execution State Transfer","Representational State Transfer","React Extended State Tool","None of the above"], correct: 1 },
];

const CODING_QS = [
  { title: "Two Sum", difficulty: "Easy", problem: "Given an array of integers, return indices of two numbers that add up to a target.", input: "nums=[2,7,11,15], target=9", output: "[0,1]" },
  { title: "Reverse String", difficulty: "Easy", problem: "Write a function to reverse a string in-place.", input: 's=["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
  { title: "Longest Substring", difficulty: "Medium", problem: "Find the length of the longest substring without repeating characters.", input: 's="abcabcbb"', output: "3" },
];

const STUDENT_INFO = {
  "Aarav Sharma":  { phone: "+91 98765 43210", email: "aarav.sharma@gmail.com",  college: "IIT Bombay",       degree: "B.Tech CSE", year: "2025" },
  "Riya Patel":    { phone: "+91 91234 56789", email: "riya.patel@outlook.com",  college: "BITS Pilani",      degree: "B.E. CSE",   year: "2025" },
  "Kunal Mehta":   { phone: "+91 99887 65432", email: "kunal.mehta@gmail.com",   college: "NIT Surat",        degree: "B.Tech IT",  year: "2025" },
  "Ananya Verma":  { phone: "+91 87654 32109", email: "ananya.verma@yahoo.com",  college: "VIT Vellore",      degree: "B.Tech CSE", year: "2024" },
  "Rahul Singh":   { phone: "+91 76543 21098", email: "rahul.singh@gmail.com",   college: "Delhi University", degree: "BCA",        year: "2025" },
  "Sneha Iyer":    { phone: "+91 65432 10987", email: "sneha.iyer@gmail.com",    college: "SRM Chennai",      degree: "B.Tech CSE", year: "2025" },
  "Dev Malhotra":  { phone: "+91 54321 09876", email: "dev.malhotra@hotmail.com",college: "Amity University", degree: "BCA",        year: "2026" },
  "Pooja Nair":    { phone: "+91 43210 98765", email: "pooja.nair@gmail.com",    college: "Manipal MIT",      degree: "B.Tech CSE", year: "2025" },
  "Aditya Joshi":  { phone: "+91 32109 87654", email: "aditya.joshi@gmail.com",  college: "Pune University",  degree: "B.Tech IT",  year: "2026" },
  "Neha Kapoor":   { phone: "+91 21098 76543", email: "neha.kapoor@yahoo.com",   college: "Chandigarh Univ",  degree: "BCA",        year: "2026" },
};

const STUDENT_PORTFOLIO = {
  "Aarav Sharma": {
    phone:"+91 98765 43210", email:"aarav.sharma@gmail.com", college:"IIT Bombay", degree:"B.Tech CSE", year:"2025",
    about:"Passionate full-stack developer with a keen interest in building scalable web applications. Love solving algorithmic problems and contributing to open source.",
    skills:["React","Node.js","MongoDB","TypeScript","AWS","Docker","GraphQL","Python"],
    quizScore:98, codingScore:95,
    projects:[
      {name:"EduTrack",desc:"A real-time student performance tracking platform built with React and Firebase.",tech:["React","Firebase","Tailwind"]},
      {name:"AlgoViz",desc:"Interactive algorithm visualizer for sorting and graph traversal algorithms.",tech:["JavaScript","D3.js","HTML/CSS"]},
      {name:"ShopEase",desc:"Full-stack e-commerce app with payment integration and admin dashboard.",tech:["Next.js","Node.js","Stripe","MongoDB"]},
    ],
    experience:[
      {role:"SDE Intern",company:"Google",duration:"May–Aug 2024"},
      {role:"Open Source Contributor",company:"Mozilla Firefox",duration:"Jan 2024–Present"},
    ],
    achievements:["Winner — Smart India Hackathon 2024","Top 1% on LeetCode","Published paper on ML optimization"],
    github:"github.com/aarav-sharma", linkedin:"linkedin.com/in/aarav-sharma",
  },
  "Riya Patel": {
    phone:"+91 91234 56789", email:"riya.patel@outlook.com", college:"BITS Pilani", degree:"B.E. CSE", year:"2025",
    about:"Frontend specialist who loves crafting pixel-perfect UIs. Experienced in design systems and accessibility-first development.",
    skills:["React","Vue.js","Figma","CSS/SCSS","JavaScript","TypeScript","Storybook","Jest"],
    quizScore:95, codingScore:91,
    projects:[
      {name:"DesignLab",desc:"Component library with 50+ accessible UI components used by 200+ developers.",tech:["React","Storybook","SCSS"]},
      {name:"TravelBlog",desc:"Travel blogging platform with rich text editor and image optimization.",tech:["Next.js","Prisma","Cloudinary"]},
    ],
    experience:[
      {role:"Frontend Intern",company:"Razorpay",duration:"Jun–Sep 2024"},
    ],
    achievements:["GATE 2024 — AIR 142","Best UI/UX — Hackbits 2023","Google WTM Scholar"],
    github:"github.com/riya-patel", linkedin:"linkedin.com/in/riya-patel",
  },
  "Kunal Mehta": {
    phone:"+91 99887 65432", email:"kunal.mehta@gmail.com", college:"NIT Surat", degree:"B.Tech IT", year:"2025",
    about:"Backend engineer obsessed with distributed systems, API design, and performance optimization. Enjoys building tools that scale.",
    skills:["Node.js","Express","PostgreSQL","Redis","Docker","Kubernetes","Go","gRPC"],
    quizScore:92, codingScore:94,
    projects:[
      {name:"QuickAPI",desc:"No-code REST API builder that generates production-ready APIs from JSON schemas.",tech:["Node.js","Express","PostgreSQL"]},
      {name:"CacheX",desc:"Distributed caching middleware for Node.js with Redis and in-memory fallback.",tech:["Node.js","Redis","TypeScript"]},
    ],
    experience:[
      {role:"Backend Intern",company:"Flipkart",duration:"Apr–Jul 2024"},
    ],
    achievements:["ACM ICPC Regionalist 2023","Top 500 — Codeforces","Best Backend — HackNITK"],
    github:"github.com/kunal-mehta", linkedin:"linkedin.com/in/kunal-mehta",
  },
  "Ananya Verma": {
    phone:"+91 87654 32109", email:"ananya.verma@yahoo.com", college:"VIT Vellore", degree:"B.Tech CSE", year:"2024",
    about:"ML engineer passionate about NLP and computer vision. Believes AI should be ethical, explainable, and accessible.",
    skills:["Python","TensorFlow","PyTorch","Scikit-learn","OpenCV","Hugging Face","SQL","Spark"],
    quizScore:89, codingScore:92,
    projects:[
      {name:"SentimentAI",desc:"Real-time sentiment analysis dashboard for social media streams using BERT.",tech:["Python","HuggingFace","FastAPI"]},
      {name:"MediScan",desc:"CNN-based medical image classifier with 94% accuracy on chest X-ray datasets.",tech:["PyTorch","OpenCV","Flask"]},
    ],
    experience:[
      {role:"ML Research Intern",company:"DRDO",duration:"May–Aug 2023"},
    ],
    achievements:["Best ML Project — VIT Tech Fest 2024","Published on arXiv","Kaggle Expert"],
    github:"github.com/ananya-verma", linkedin:"linkedin.com/in/ananya-verma",
  },
  "Rahul Singh": {
    phone:"+91 76543 21098", email:"rahul.singh@gmail.com", college:"Delhi University", degree:"BCA", year:"2025",
    about:"Creative developer who blends design thinking with code. Loves building mobile-first experiences and gamified learning apps.",
    skills:["React Native","JavaScript","Firebase","UI/UX","Figma","Redux","Expo","SQLite"],
    quizScore:86, codingScore:82,
    projects:[
      {name:"LearnMate",desc:"Gamified learning app for students with streaks, badges, and peer challenges.",tech:["React Native","Firebase","Expo"]},
      {name:"BudgetBuddy",desc:"Personal finance tracker with AI-driven spending insights.",tech:["React Native","SQLite","Chart.js"]},
    ],
    experience:[
      {role:"Mobile Dev Intern",company:"Paytm",duration:"Jun–Aug 2024"},
    ],
    achievements:["Winner — Delhi Startup Hackathon 2024","App reached 5K+ downloads on Play Store"],
    github:"github.com/rahul-singh", linkedin:"linkedin.com/in/rahul-singh",
  },
  "Sneha Iyer": {
    phone:"+91 65432 10987", email:"sneha.iyer@gmail.com", college:"SRM Chennai", degree:"B.Tech CSE", year:"2025",
    about:"DevOps and cloud enthusiast with a love for automating everything. Believes in zero-downtime deployments and clean CI/CD pipelines.",
    skills:["AWS","Docker","Kubernetes","Terraform","Jenkins","Linux","Python","Bash"],
    quizScore:83, codingScore:85,
    projects:[
      {name:"AutoDeploy",desc:"End-to-end CI/CD pipeline tool with Slack notifications and rollback support.",tech:["Jenkins","Docker","AWS EC2"]},
      {name:"CloudCost",desc:"AWS cost optimization dashboard with anomaly detection and budget alerts.",tech:["Python","AWS Lambda","React"]},
    ],
    experience:[
      {role:"Cloud Intern",company:"Infosys",duration:"Jan–Apr 2024"},
    ],
    achievements:["AWS Certified Developer","Best DevOps Project — SRM Hackathon 2024"],
    github:"github.com/sneha-iyer", linkedin:"linkedin.com/in/sneha-iyer",
  },
  "Dev Malhotra": {
    phone:"+91 54321 09876", email:"dev.malhotra@hotmail.com", college:"Amity University", degree:"BCA", year:"2026",
    about:"Security-focused developer passionate about ethical hacking and building secure applications. CTF enthusiast.",
    skills:["Python","Cybersecurity","Penetration Testing","Linux","Bash","C","Wireshark","Metasploit"],
    quizScore:80, codingScore:74,
    projects:[
      {name:"VaultScan",desc:"Web vulnerability scanner that detects OWASP Top 10 issues automatically.",tech:["Python","Flask","BeautifulSoup"]},
      {name:"SecureAuth",desc:"Two-factor authentication library with TOTP and biometric fallback.",tech:["Node.js","JWT","Crypto"]},
    ],
    experience:[
      {role:"Security Intern",company:"TCS CyberSecurity",duration:"May–Jul 2024"},
    ],
    achievements:["Top 10% — HackTheBox","CEH Certified","Winner — Cyber Suraksha CTF 2024"],
    github:"github.com/dev-malhotra", linkedin:"linkedin.com/in/dev-malhotra",
  },
  "Pooja Nair": {
    phone:"+91 43210 98765", email:"pooja.nair@gmail.com", college:"Manipal MIT", degree:"B.Tech CSE", year:"2025",
    about:"Data analyst who turns raw numbers into compelling stories. Proficient in end-to-end analytics pipelines and business intelligence.",
    skills:["Python","SQL","Power BI","Tableau","Excel","Pandas","NumPy","Spark"],
    quizScore:77, codingScore:79,
    projects:[
      {name:"SalesPulse",desc:"Sales analytics dashboard with predictive forecasting and KPI tracking.",tech:["Python","Power BI","SQL"]},
      {name:"CropInsight",desc:"Agricultural data analysis tool helping farmers optimize yield using weather APIs.",tech:["Python","Pandas","Tableau"]},
    ],
    experience:[
      {role:"Data Analyst Intern",company:"Deloitte",duration:"Jun–Sep 2024"},
    ],
    achievements:["Best Data Project — Manipal Hackathon 2023","Microsoft Power BI Certified"],
    github:"github.com/pooja-nair", linkedin:"linkedin.com/in/pooja-nair",
  },
  "Aditya Joshi": {
    phone:"+91 32109 87654", email:"aditya.joshi@gmail.com", college:"Pune University", degree:"B.Tech IT", year:"2026",
    about:"Systems programmer with a deep interest in operating systems, compilers, and low-level optimization. Loves tinkering with hardware.",
    skills:["C","C++","Rust","Assembly","Linux Kernel","LLVM","Python","Embedded Systems"],
    quizScore:74, codingScore:71,
    projects:[
      {name:"TinyOS",desc:"Lightweight OS kernel built from scratch with memory management and basic scheduling.",tech:["C","Assembly","QEMU"]},
      {name:"RustLex",desc:"Fast lexer/tokenizer library in Rust with zero-copy parsing.",tech:["Rust","LLVM"]},
    ],
    experience:[
      {role:"Systems Intern",company:"Intel",duration:"Jul–Sep 2024"},
    ],
    achievements:["ICPC Asia Regionalist 2024","Open Source — contributed to Linux Kernel"],
    github:"github.com/aditya-joshi", linkedin:"linkedin.com/in/aditya-joshi",
  },
  "Neha Kapoor": {
    phone:"+91 21098 76543", email:"neha.kapoor@yahoo.com", college:"Chandigarh Univ", degree:"BCA", year:"2026",
    about:"UI/UX designer and frontend developer who creates beautiful, user-centric digital experiences. Passionate about accessibility and inclusive design.",
    skills:["Figma","React","CSS/SCSS","Adobe XD","JavaScript","Framer Motion","Lottie","Webflow"],
    quizScore:71, codingScore:68,
    projects:[
      {name:"AccessFirst",desc:"Design system focused on WCAG AA+ accessibility compliance with 30+ components.",tech:["React","Figma","SCSS"]},
      {name:"AnimaFlow",desc:"No-code animation builder for web developers using drag-and-drop timeline.",tech:["React","Framer Motion","Lottie"]},
    ],
    experience:[
      {role:"UI/UX Intern",company:"Zomato",duration:"Mar–Jun 2024"},
    ],
    achievements:["Best Design — Hackbits 2024","Adobe Certified Professional","Featured on Dribbble"],
    github:"github.com/neha-kapoor", linkedin:"linkedin.com/in/neha-kapoor",
  },
};

const students = [
  { id:1,  name:"Aarav Sharma",  img:"https://i.pravatar.cc/100?img=10", percentage:98 },
  { id:2,  name:"Riya Patel",    img:"https://i.pravatar.cc/100?img=11", percentage:95 },
  { id:3,  name:"Kunal Mehta",   img:"https://i.pravatar.cc/100?img=12", percentage:92 },
  { id:4,  name:"Ananya Verma",  img:"https://i.pravatar.cc/100?img=13", percentage:89 },
  { id:5,  name:"Rahul Singh",   img:"https://i.pravatar.cc/100?img=14", percentage:86 },
  { id:6,  name:"Sneha Iyer",    img:"https://i.pravatar.cc/100?img=15", percentage:83 },
  { id:7,  name:"Dev Malhotra",  img:"https://i.pravatar.cc/100?img=16", percentage:80 },
  { id:8,  name:"Pooja Nair",    img:"https://i.pravatar.cc/100?img=17", percentage:77 },
  { id:9,  name:"Aditya Joshi",  img:"https://i.pravatar.cc/100?img=18", percentage:74 },
  { id:10, name:"Neha Kapoor",   img:"https://i.pravatar.cc/100?img=19", percentage:71 },
];

const jobHistory = {
  1:[{name:"Aarav Sharma",img:"https://i.pravatar.cc/100?img=10",date:"Mar 01, 2026",quiz:92,coding:88,status:"Hired"},{name:"Riya Patel",img:"https://i.pravatar.cc/100?img=11",date:"Mar 02, 2026",quiz:85,coding:79,status:"In Review"},{name:"Dev Malhotra",img:"https://i.pravatar.cc/100?img=16",date:"Mar 03, 2026",quiz:70,coding:60,status:"Rejected"},{name:"Pooja Nair",img:"https://i.pravatar.cc/100?img=17",date:"Mar 04, 2026",quiz:88,coding:82,status:"In Review"},{name:"Neha Kapoor",img:"https://i.pravatar.cc/100?img=19",date:"Mar 05, 2026",quiz:55,coding:48,status:"Rejected"}],
  2:[{name:"Kunal Mehta",img:"https://i.pravatar.cc/100?img=12",date:"Feb 25, 2026",quiz:90,coding:94,status:"Hired"},{name:"Rahul Singh",img:"https://i.pravatar.cc/100?img=14",date:"Feb 26, 2026",quiz:80,coding:75,status:"In Review"},{name:"Aditya Joshi",img:"https://i.pravatar.cc/100?img=18",date:"Feb 27, 2026",quiz:65,coding:58,status:"Rejected"},{name:"Sneha Iyer",img:"https://i.pravatar.cc/100?img=15",date:"Feb 28, 2026",quiz:87,coding:83,status:"In Review"}],
  3:[{name:"Ananya Verma",img:"https://i.pravatar.cc/100?img=13",date:"Mar 01, 2026",quiz:95,coding:91,status:"Hired"},{name:"Aarav Sharma",img:"https://i.pravatar.cc/100?img=10",date:"Mar 02, 2026",quiz:88,coding:84,status:"In Review"},{name:"Riya Patel",img:"https://i.pravatar.cc/100?img=11",date:"Mar 03, 2026",quiz:76,coding:70,status:"Rejected"},{name:"Kunal Mehta",img:"https://i.pravatar.cc/100?img=12",date:"Mar 04, 2026",quiz:91,coding:89,status:"Hired"},{name:"Pooja Nair",img:"https://i.pravatar.cc/100?img=17",date:"Mar 05, 2026",quiz:62,coding:55,status:"Rejected"},{name:"Dev Malhotra",img:"https://i.pravatar.cc/100?img=16",date:"Mar 06, 2026",quiz:78,coding:72,status:"In Review"}],
  4:[{name:"Sneha Iyer",img:"https://i.pravatar.cc/100?img=15",date:"Feb 20, 2026",quiz:89,coding:85,status:"Hired"},{name:"Neha Kapoor",img:"https://i.pravatar.cc/100?img=19",date:"Feb 21, 2026",quiz:72,coding:66,status:"Rejected"},{name:"Ananya Verma",img:"https://i.pravatar.cc/100?img=13",date:"Feb 22, 2026",quiz:84,coding:80,status:"In Review"}],
  5:[{name:"Rahul Singh",img:"https://i.pravatar.cc/100?img=14",date:"Feb 18, 2026",quiz:86,coding:80,status:"Hired"},{name:"Aditya Joshi",img:"https://i.pravatar.cc/100?img=18",date:"Feb 19, 2026",quiz:74,coding:68,status:"In Review"},{name:"Neha Kapoor",img:"https://i.pravatar.cc/100?img=19",date:"Feb 20, 2026",quiz:60,coding:52,status:"Rejected"},{name:"Riya Patel",img:"https://i.pravatar.cc/100?img=11",date:"Feb 21, 2026",quiz:91,coding:87,status:"Hired"}],
  6:[{name:"Kunal Mehta",img:"https://i.pravatar.cc/100?img=12",date:"Feb 10, 2026",quiz:93,coding:90,status:"Hired"},{name:"Dev Malhotra",img:"https://i.pravatar.cc/100?img=16",date:"Feb 11, 2026",quiz:78,coding:74,status:"In Review"},{name:"Rahul Singh",img:"https://i.pravatar.cc/100?img=14",date:"Feb 12, 2026",quiz:66,coding:60,status:"Rejected"}],
  7:[{name:"Aarav Sharma",img:"https://i.pravatar.cc/100?img=10",date:"Feb 05, 2026",quiz:97,coding:93,status:"Hired"},{name:"Pooja Nair",img:"https://i.pravatar.cc/100?img=17",date:"Feb 06, 2026",quiz:80,coding:76,status:"In Review"},{name:"Sneha Iyer",img:"https://i.pravatar.cc/100?img=15",date:"Feb 07, 2026",quiz:69,coding:61,status:"Rejected"},{name:"Ananya Verma",img:"https://i.pravatar.cc/100?img=13",date:"Feb 08, 2026",quiz:88,coding:84,status:"In Review"},{name:"Aditya Joshi",img:"https://i.pravatar.cc/100?img=18",date:"Feb 09, 2026",quiz:75,coding:69,status:"In Review"}],
  8:[{name:"Neha Kapoor",img:"https://i.pravatar.cc/100?img=19",date:"Jan 28, 2026",quiz:82,coding:77,status:"Hired"},{name:"Riya Patel",img:"https://i.pravatar.cc/100?img=11",date:"Jan 29, 2026",quiz:90,coding:86,status:"Hired"},{name:"Dev Malhotra",img:"https://i.pravatar.cc/100?img=16",date:"Jan 30, 2026",quiz:58,coding:50,status:"Rejected"}],
  9:[{name:"Ananya Verma",img:"https://i.pravatar.cc/100?img=13",date:"Jan 20, 2026",quiz:94,coding:92,status:"Hired"},{name:"Kunal Mehta",img:"https://i.pravatar.cc/100?img=12",date:"Jan 21, 2026",quiz:87,coding:83,status:"In Review"},{name:"Rahul Singh",img:"https://i.pravatar.cc/100?img=14",date:"Jan 22, 2026",quiz:70,coding:64,status:"Rejected"},{name:"Aarav Sharma",img:"https://i.pravatar.cc/100?img=10",date:"Jan 23, 2026",quiz:96,coding:95,status:"Hired"}],
  10:[{name:"Sneha Iyer",img:"https://i.pravatar.cc/100?img=15",date:"Jan 15, 2026",quiz:88,coding:85,status:"Hired"},{name:"Aditya Joshi",img:"https://i.pravatar.cc/100?img=18",date:"Jan 16, 2026",quiz:73,coding:67,status:"In Review"},{name:"Pooja Nair",img:"https://i.pravatar.cc/100?img=17",date:"Jan 17, 2026",quiz:61,coding:55,status:"Rejected"},{name:"Neha Kapoor",img:"https://i.pravatar.cc/100?img=19",date:"Jan 18, 2026",quiz:79,coding:74,status:"In Review"},{name:"Dev Malhotra",img:"https://i.pravatar.cc/100?img=16",date:"Jan 19, 2026",quiz:85,coding:81,status:"Hired"}],
};

const initialJobs = [
  { id:1,  title:"Frontend Developer",        experience:"0–2 Years",  salary:"₹4 – ₹6 LPA",   skills:["HTML","CSS","React"],                 languages:["JavaScript"],        description:"Responsible for building responsive and interactive user interfaces using React.",         daysLeft:14 },
  { id:2,  title:"Backend Developer",         experience:"1–3 Years",  salary:"₹6 – ₹9 LPA",   skills:["Node.js","Express","MongoDB"],         languages:["JavaScript"],        description:"Develop and maintain server-side logic, APIs, and databases.",                           daysLeft:21 },
  { id:3,  title:"Full Stack Developer",      experience:"1–4 Years",  salary:"₹8 – ₹12 LPA",  skills:["React","Node.js","MongoDB"],           languages:["JavaScript"],        description:"Handle both frontend and backend development tasks.",                                    daysLeft:7  },
  { id:4,  title:"UI/UX Designer",            experience:"0–2 Years",  salary:"₹3 – ₹5 LPA",   skills:["Figma","Wireframing","Prototyping"],   languages:["Design Principles"], description:"Design intuitive and visually appealing user interfaces.",                               daysLeft:30 },
  { id:5,  title:"Data Analyst",              experience:"0–3 Years",  salary:"₹5 – ₹8 LPA",   skills:["SQL","Excel","Power BI"],              languages:["Python"],            description:"Analyze large datasets to identify trends and insights.",                               daysLeft:10 },
  { id:6,  title:"DevOps Engineer",           experience:"2–5 Years",  salary:"₹10 – ₹15 LPA", skills:["Docker","AWS","CI/CD"],               languages:["Shell","Python"],    description:"Manage cloud infrastructure and maintain CI/CD pipelines.",                             daysLeft:3  },
  { id:7,  title:"Mobile App Developer",      experience:"1–3 Years",  salary:"₹6 – ₹10 LPA",  skills:["React Native","Firebase"],            languages:["JavaScript"],        description:"Develop and maintain mobile applications for Android and iOS.",                         daysLeft:18 },
  { id:8,  title:"Software Tester (QA)",      experience:"0–2 Years",  salary:"₹3 – ₹5 LPA",   skills:["Manual Testing","Automation Basics"], languages:["Java","Python"],     description:"Test applications to identify bugs and performance issues.",                            daysLeft:25 },
  { id:9,  title:"Machine Learning Engineer", experience:"1–4 Years",  salary:"₹9 – ₹14 LPA",  skills:["ML Algorithms","Data Modeling"],      languages:["Python"],            description:"Build, train, and deploy machine learning models.",                                     daysLeft:5  },
  { id:10, title:"Cyber Security Analyst",    experience:"1–3 Years",  salary:"₹7 – ₹11 LPA",  skills:["Network Security","Threat Analysis"], languages:["Python"],            description:"Monitor systems for security threats and analyze vulnerabilities.",                     daysLeft:12 },
];

const makeQuiz   = () => Array.from({length:20}, ()=>({question:"",options:["","","",""],correct:0}));
const makeCoding = () => Array.from({length:3},  ()=>({title:"",problem:"",input:"",output:"",hint:""}));
const emptyForm  = {title:"",experience:"",salary:"",description:"",skillsInput:"",languagesInput:"",daysLeft:""};
const DIFF       = ["Easy","Medium","Hard"];

const buildQuizAnswers = (score) => {
  const nCorrect = Math.round((score/100)*20);
  return QUIZ_QS.map((q,i) => {
    const isCorrect = i < nCorrect;
    const chosen    = isCorrect ? q.correct : (q.correct+1+(i%3))%4;
    return {...q, chosen, isCorrect};
  });
};
const buildCodingAnswers = (score) => {
  const passed = score>=85?3:score>=65?2:1;
  return CODING_QS.map((q,i)=>({
    ...q, passed:i<passed,
    timeTaken:`${12+i*7+(score%5)}m`,
    studentCode: i<passed
      ? `function solution(input) {\n  // Correct approach\n  return ${q.output};\n}`
      : `function solution(input) {\n  // Incomplete solution\n  return null;\n}`,
  }));
};

/* ── Duration Badge ── */
const DurationBadge = ({ daysLeft }) => {
  const urgent  = daysLeft <= 5;
  const warning = daysLeft <= 10;
  const bg      = urgent ? "#fff5f5" : warning ? "#fff8e6" : "#f0fdf4";
  const border  = urgent ? "#fca5a5" : warning ? "#fcd34d" : "#86efac";
  const color   = urgent ? "#b91c1c" : warning ? "#92400e" : "#15803d";
  const icon    = urgent ? "🔴" : warning ? "🟡" : "🟢";
  const label   = daysLeft === 0 ? "Closing today!" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:"5px",
      background:bg, border:`1.5px solid ${border}`, color,
      fontSize:"13px", fontWeight:700, padding:"5px 12px",
      borderRadius:"20px", whiteSpace:"nowrap",
    }}>
      {icon} {label} to apply
    </span>
  );
};

const ScoreBar = ({label,value}) => (
  <div className="score-bar-wrap">
    <div className="score-bar-label"><span>{label}</span><span className="score-val">{value}%</span></div>
    <div className="score-bar-track">
      <div className="score-bar-fill" style={{width:`${value}%`,background:value>=80?"#4caf82":value>=60?"#f0a500":"#e53e3e"}}/>
    </div>
  </div>
);


/* ─────────── PORTFOLIO MODAL ─────────── */
const PortfolioModal = ({student, onClose}) => {
  const p = STUDENT_PORTFOLIO[student.name];
  if (!p) return null;
  const rankColors = student.id===1?["#553f9a","#7b5fc4"]:student.id===2?["#6a55b8","#8573cc"]:student.id===3?["#8573cc","#a394d8"]:["#553f9a","#7b5fc4"];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}} onClick={onClose}>
      <div style={{background:"#ffffff",borderRadius:"20px",width:"780px",maxWidth:"95vw",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.25)",fontFamily:"'Trebuchet MS',Arial,sans-serif"}} onClick={e=>e.stopPropagation()}>

        {/* ── HERO BANNER ── */}
        <div style={{background:`linear-gradient(135deg,${rankColors[0]},${rankColors[1]})`,borderRadius:"20px 20px 0 0",padding:"32px 36px 28px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"-30px",right:"-30px",width:"160px",height:"160px",borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"100px",width:"100px",height:"100px",borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>

          {/* close */}
          <button onClick={onClose} style={{position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:"36px",height:"36px",fontSize:"18px",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>

          <div style={{display:"flex",gap:"24px",alignItems:"flex-start"}}>
            <img src={student.img} alt={student.name} style={{width:"90px",height:"90px",borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.5)",flexShrink:0,boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"6px"}}>
                <span style={{fontSize:"24px",fontWeight:800,color:"#fff"}}>{student.name}</span>
                <span style={{background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:"12px",fontWeight:700,padding:"3px 12px",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.3)"}}>Rank #{student.id}</span>
              </div>
              <div style={{fontSize:"14px",color:"rgba(255,255,255,0.85)",marginBottom:"14px"}}>🎓 {p.degree} · {p.college} · Batch {p.year}</div>
              <p style={{fontSize:"13px",color:"rgba(255,255,255,0.78)",lineHeight:1.6,margin:"0 0 16px",maxWidth:"480px"}}>{p.about}</p>
              {/* score pills */}
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                <span style={{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",fontSize:"13px",fontWeight:700,padding:"5px 14px",borderRadius:"20px"}}>⭐ Overall: {student.percentage}%</span>
                <span style={{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",fontSize:"13px",fontWeight:700,padding:"5px 14px",borderRadius:"20px"}}>📝 Quiz: {p.quizScore}%</span>
                <span style={{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",fontSize:"13px",fontWeight:700,padding:"5px 14px",borderRadius:"20px"}}>💻 Coding: {p.codingScore}%</span>
              </div>
            </div>
          </div>

          {/* contact row */}
          <div style={{display:"flex",gap:"20px",marginTop:"20px",flexWrap:"wrap"}}>
            {[["📞",p.phone],["✉️",p.email],["🔗",p.github],["💼",p.linkedin]].map(([ic,val])=>(
              <span key={val} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"rgba(255,255,255,0.8)"}}>
                <span>{ic}</span><span>{val}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{padding:"28px 36px",display:"flex",flexDirection:"column",gap:"28px"}}>

          {/* Skills */}
          <div>
            <h3 style={{margin:"0 0 14px",fontSize:"16px",fontWeight:700,color:"#2d1f6e",display:"flex",alignItems:"center",gap:"8px"}}>🛠️ Skills</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {p.skills.map(sk=>(
                <span key={sk} style={{background:"#f3f0ff",color:"#553f9a",fontSize:"13px",fontWeight:600,padding:"6px 14px",borderRadius:"20px",border:"1.5px solid #e0d9f5"}}>{sk}</span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <h3 style={{margin:"0 0 14px",fontSize:"16px",fontWeight:700,color:"#2d1f6e",display:"flex",alignItems:"center",gap:"8px"}}>🚀 Projects</h3>
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {p.projects.map(pr=>(
                <div key={pr.name} style={{background:"linear-gradient(145deg,#faf8ff,#f3f0ff)",border:"1.5px solid #e0d9f5",borderRadius:"14px",padding:"16px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px",flexWrap:"wrap"}}>
                    <span style={{fontSize:"15px",fontWeight:700,color:"#2d1f6e"}}>{pr.name}</span>
                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                      {pr.tech.map(t=><span key={t} style={{background:"#ede8fb",color:"#553f9a",fontSize:"11px",fontWeight:600,padding:"2px 8px",borderRadius:"20px"}}>{t}</span>)}
                    </div>
                  </div>
                  <p style={{margin:0,fontSize:"13px",color:"#555",lineHeight:1.55}}>{pr.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 style={{margin:"0 0 14px",fontSize:"16px",fontWeight:700,color:"#2d1f6e",display:"flex",alignItems:"center",gap:"8px"}}>💼 Experience</h3>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {p.experience.map(ex=>(
                <div key={ex.role} style={{display:"flex",alignItems:"center",gap:"14px",background:"#faf8ff",border:"1.5px solid #e0d9f5",borderRadius:"12px",padding:"14px 18px"}}>
                  <div style={{width:"42px",height:"42px",borderRadius:"12px",background:"linear-gradient(135deg,#ede8fb,#ddd5f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>🏢</div>
                  <div>
                    <div style={{fontSize:"14px",fontWeight:700,color:"#2d1f6e"}}>{ex.role}</div>
                    <div style={{fontSize:"13px",color:"#553f9a",fontWeight:600}}>{ex.company}</div>
                    <div style={{fontSize:"12px",color:"#9d8ec4"}}>{ex.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 style={{margin:"0 0 14px",fontSize:"16px",fontWeight:700,color:"#2d1f6e",display:"flex",alignItems:"center",gap:"8px"}}>🏆 Achievements</h3>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {p.achievements.map(ac=>(
                <div key={ac} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 16px",background:"#faf8ff",border:"1.5px solid #e0d9f5",borderRadius:"10px"}}>
                  <span style={{color:"#553f9a",fontSize:"16px",flexShrink:0}}>✦</span>
                  <span style={{fontSize:"13px",color:"#333",fontWeight:500}}>{ac}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─────────── STUDENT DETAIL MODAL ─────────── */
const StudentDetailModal = ({applicant, onBack, onClose}) => {
  const [view, setView] = useState(null);
  const quiz   = buildQuizAnswers(applicant.quiz);
  const coding = buildCodingAnswers(applicant.coding);
  const info   = STUDENT_INFO[applicant.name] || {phone:"N/A",email:"N/A",college:"N/A",degree:"N/A",year:"N/A"};

  const quizCorrect  = quiz.filter(q=>q.isCorrect).length;
  const codingPassed = coding.filter(c=>c.passed).length;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div style={{background:"#ffffff",color:"#111827",fontFamily:"'Trebuchet MS',Arial,sans-serif",borderRadius:"16px",padding:"28px 32px",width:"860px",maxWidth:"95vw",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
        <style>{`.sdm-inner *{box-sizing:border-box}`}</style>
        <div className="sdm-inner">

          {/* TOP ROW */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
            <button style={{padding:"9px 20px",background:"#f3f0ff",color:"#553f9a",border:"1.5px solid #d8d0f5",borderRadius:"9px",fontSize:"14px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",fontFamily:"inherit"}} onClick={view?()=>setView(null):onBack}>
              ← {view?"Back to Profile":"Back"}
            </button>
            <button style={{background:"none",border:"none",fontSize:"24px",color:"#888",cursor:"pointer",lineHeight:1}} onClick={onClose}>✕</button>
          </div>

          {/* PROFILE BANNER */}
          <div style={{display:"flex",gap:"22px",background:"linear-gradient(135deg,#553f9a,#7b5fc4)",borderRadius:"16px",padding:"24px 28px",marginBottom:"28px"}}>
            <img src={applicant.img} alt={applicant.name} style={{width:"82px",height:"82px",borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.45)",flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px",flexWrap:"wrap"}}>
                <span style={{fontSize:"22px",fontWeight:700,color:"#fff"}}>{applicant.name}</span>
                <span style={{fontSize:"12px",fontWeight:700,padding:"4px 14px",borderRadius:"20px",background:applicant.status==="Hired"?"rgba(34,197,94,0.25)":applicant.status==="In Review"?"rgba(251,191,36,0.25)":"rgba(239,68,68,0.25)",color:"#fff",border:"1px solid rgba(255,255,255,0.35)"}}>{applicant.status}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px 24px",marginBottom:"14px"}}>
                {[["📞",info.phone],["✉️",info.email],["🎓",info.college],["📋",`${info.degree} · Batch ${info.year}`],["📅",`Applied: ${applicant.date}`]].map(([ic,val],i)=>(
                  <div key={i} style={{display:"flex",gap:"8px",alignItems:"center"}}>
                    <span style={{fontSize:"14px"}}>{ic}</span>
                    <span style={{color:"rgba(255,255,255,0.92)",fontSize:"13px"}}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                <span style={{padding:"6px 16px",borderRadius:"20px",fontSize:"13px",fontWeight:700,background:"rgba(34,197,94,0.2)",color:"#bbf7d0",border:"1px solid rgba(34,197,94,0.35)"}}>Quiz: {applicant.quiz}%</span>
                <span style={{padding:"6px 16px",borderRadius:"20px",fontSize:"13px",fontWeight:700,background:"rgba(96,165,250,0.2)",color:"#bfdbfe",border:"1px solid rgba(96,165,250,0.35)"}}>Coding: {applicant.coding}%</span>
              </div>
            </div>
          </div>

          {/* LANDING */}
          {!view && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
              <button onClick={()=>setView("quiz")} style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"14px",padding:"28px 26px",background:"#faf8ff",border:"2px solid #d8d0f5",borderRadius:"16px",cursor:"pointer",textAlign:"left",transition:"all 0.2s",fontFamily:"inherit",width:"100%"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#f0ebff";e.currentTarget.style.borderColor="#553f9a";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(85,63,154,0.18)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#faf8ff";e.currentTarget.style.borderColor="#d8d0f5";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{width:"52px",height:"52px",borderRadius:"14px",background:"linear-gradient(135deg,#553f9a,#7b5fc4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px"}}>📝</div>
                <div><div style={{fontSize:"17px",fontWeight:700,color:"#111827",marginBottom:"6px"}}>View Quiz Paper</div><div style={{fontSize:"13px",color:"#6b7280",lineHeight:"1.5"}}>See all 20 questions attempted by the student with correct & wrong answers marked.</div></div>
                <div style={{display:"flex",gap:"10px",marginTop:"4px",flexWrap:"wrap"}}>
                  <span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:700,background:"#dcfce7",color:"#15803d"}}>✓ {quizCorrect} Correct</span>
                  <span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:700,background:"#fee2e2",color:"#b91c1c"}}>✗ {20-quizCorrect} Wrong</span>
                </div>
                <div style={{alignSelf:"flex-end",marginTop:"4px",fontSize:"13px",fontWeight:600,color:"#553f9a"}}>Open Quiz Paper →</div>
              </button>
              <button onClick={()=>setView("coding")} style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"14px",padding:"28px 26px",background:"#f0f9ff",border:"2px solid #bae6fd",borderRadius:"16px",cursor:"pointer",textAlign:"left",transition:"all 0.2s",fontFamily:"inherit",width:"100%"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#e0f2fe";e.currentTarget.style.borderColor="#0284c7";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(2,132,199,0.18)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#f0f9ff";e.currentTarget.style.borderColor="#bae6fd";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{width:"52px",height:"52px",borderRadius:"14px",background:"linear-gradient(135deg,#0284c7,#38bdf8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px"}}>💻</div>
                <div><div style={{fontSize:"17px",fontWeight:700,color:"#111827",marginBottom:"6px"}}>View Coding Round</div><div style={{fontSize:"13px",color:"#6b7280",lineHeight:"1.5"}}>Review all 3 coding problems with the student's submitted code and test case results.</div></div>
                <div style={{display:"flex",gap:"10px",marginTop:"4px",flexWrap:"wrap"}}>
                  <span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:700,background:"#dcfce7",color:"#15803d"}}>✓ {codingPassed} Passed</span>
                  <span style={{padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:700,background:"#fee2e2",color:"#b91c1c"}}>✗ {3-codingPassed} Failed</span>
                </div>
                <div style={{alignSelf:"flex-end",marginTop:"4px",fontSize:"13px",fontWeight:600,color:"#0284c7"}}>Open Coding Round →</div>
              </button>
            </div>
          )}

          {/* QUIZ VIEW */}
          {view==="quiz" && (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
                <div><h3 style={{margin:0,fontSize:"18px",fontWeight:700,color:"#111827"}}>📝 Quiz Paper</h3><p style={{margin:"4px 0 0",fontSize:"13px",color:"#6b7280"}}>{quizCorrect}/20 correct answers</p></div>
                <div style={{display:"flex",gap:"10px"}}>
                  <span style={{padding:"5px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:700,background:"#dcfce7",color:"#15803d"}}>✓ {quizCorrect} Correct</span>
                  <span style={{padding:"5px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:700,background:"#fee2e2",color:"#b91c1c"}}>✗ {20-quizCorrect} Wrong</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                {quiz.map((q,qi)=>(
                  <div key={qi} style={{borderRadius:"12px",border:`2px solid ${q.isCorrect?"#86efac":"#fca5a5"}`,background:"#ffffff"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:"10px",padding:"14px 18px",background:q.isCorrect?"#f0fdf4":"#fff5f5",borderRadius:"10px 10px 0 0",flexWrap:"wrap"}}>
                      <span style={{color:"#553f9a",fontSize:"11px",fontWeight:700,background:"#ede8fb",padding:"3px 10px",borderRadius:"20px",flexShrink:0,whiteSpace:"nowrap",marginTop:"2px"}}>Q{qi+1}</span>
                      <p style={{color:"#111827",fontSize:"14px",fontWeight:600,lineHeight:1.55,flex:1,margin:0}}>{q.q}</p>
                      <span style={{fontSize:"11px",fontWeight:700,padding:"3px 12px",borderRadius:"20px",flexShrink:0,whiteSpace:"nowrap",marginTop:"2px",background:q.isCorrect?"#16a34a":"#dc2626",color:"#ffffff"}}>{q.isCorrect?"✓ Correct":"✗ Wrong"}</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:"7px",padding:"12px 18px 14px",background:"#ffffff",borderRadius:"0 0 10px 10px"}}>
                      {q.options.map((opt,oi)=>{
                        const isRight=oi===q.correct, isWrong=oi===q.chosen&&!q.isCorrect;
                        return (
                          <div key={oi} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 13px",borderRadius:"8px",background:isRight?"#dcfce7":isWrong?"#fee2e2":"#f9fafb",border:`1.5px solid ${isRight?"#4ade80":isWrong?"#f87171":"#e5e7eb"}`}}>
                            <span style={{color:"#553f9a",fontSize:"11px",fontWeight:800,width:"18px",flexShrink:0}}>{["A","B","C","D"][oi]}</span>
                            <span style={{color:"#111827",fontSize:"13px",flex:1,lineHeight:1.4}}>{opt}</span>
                            {isRight&&<span style={{background:"#16a34a",color:"#ffffff",fontSize:"10px",fontWeight:700,padding:"2px 9px",borderRadius:"20px",flexShrink:0,whiteSpace:"nowrap"}}>✓ Correct Answer</span>}
                            {isWrong&&<span style={{background:"#dc2626",color:"#ffffff",fontSize:"10px",fontWeight:700,padding:"2px 9px",borderRadius:"20px",flexShrink:0,whiteSpace:"nowrap"}}>✗ Student's Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CODING VIEW */}
          {view==="coding" && (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
                <div><h3 style={{margin:0,fontSize:"18px",fontWeight:700,color:"#111827"}}>💻 Coding Round</h3><p style={{margin:"4px 0 0",fontSize:"13px",color:"#6b7280"}}>{codingPassed}/3 problems passed</p></div>
                <div style={{display:"flex",gap:"10px"}}>
                  <span style={{padding:"5px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:700,background:"#dcfce7",color:"#15803d"}}>✓ {codingPassed} Passed</span>
                  <span style={{padding:"5px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:700,background:"#fee2e2",color:"#b91c1c"}}>✗ {3-codingPassed} Failed</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
                {coding.map((c,ci)=>(
                  <div key={ci} style={{borderRadius:"12px",border:`2px solid ${c.passed?"#86efac":"#fca5a5"}`,background:"#ffffff"}}>
                    <div style={{padding:"16px 20px 14px",background:c.passed?"#f0fdf4":"#fff5f5",borderRadius:"10px 10px 0 0"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px",flexWrap:"wrap"}}>
                        <span style={{color:"#553f9a",fontSize:"12px",fontWeight:700,background:"#ede8fb",padding:"3px 11px",borderRadius:"20px",whiteSpace:"nowrap"}}>Problem {ci+1}</span>
                        <span style={{fontSize:"12px",fontWeight:700,padding:"3px 10px",borderRadius:"20px",whiteSpace:"nowrap",background:c.difficulty==="Easy"?"#dcfce7":c.difficulty==="Medium"?"#fef9c3":"#fee2e2",color:c.difficulty==="Easy"?"#15803d":c.difficulty==="Medium"?"#a16207":"#b91c1c"}}>{c.difficulty}</span>
                        <span style={{marginLeft:"auto",fontSize:"12px",fontWeight:700,padding:"4px 14px",borderRadius:"20px",background:c.passed?"#16a34a":"#dc2626",color:"#fff",whiteSpace:"nowrap"}}>{c.passed?"✓ Passed":"✗ Failed"}</span>
                      </div>
                      <p style={{color:"#111827",fontSize:"15px",fontWeight:700,margin:0,lineHeight:1.4}}>{c.title}</p>
                      <p style={{color:"#374151",fontSize:"13px",margin:"6px 0 0",lineHeight:1.6}}>{c.problem}</p>
                    </div>
                    <div style={{padding:"16px 20px",background:"#ffffff",borderTop:"1px solid #e5e7eb"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",flexWrap:"wrap",gap:"8px"}}>
                        <span style={{color:"#553f9a",fontSize:"13px",fontWeight:700}}>Student's Submitted Code</span>
                        <span style={{color:"#6b7280",fontSize:"12px"}}>⏱ Time taken: {c.timeTaken}</span>
                      </div>
                      <pre style={{margin:0,background:"#1e1e2e",color:"#cdd6f4",padding:"16px",borderRadius:"10px",fontSize:"12px",fontFamily:"'Courier New',monospace",lineHeight:"1.8",overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{c.studentCode}</pre>
                    </div>
                    <div style={{padding:"12px 20px",fontSize:"13px",fontWeight:600,background:c.passed?"#dcfce7":"#fee2e2",color:c.passed?"#15803d":"#b91c1c",borderTop:"1px solid #e5e7eb",borderRadius:"0 0 10px 10px"}}>
                      {c.passed?"✅ All test cases passed — output matched expected result.":"❌ Test cases failed — output did not match expected result."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ─────────── MAIN COMPONENT ─────────── */
const Landing = () => {
  const navigate = useNavigate();
  const [activeTab,     setActiveTab]     = useState("dashboard");
  const [jobs,          setJobs]          = useState(initialJobs);
  const [showModal,     setShowModal]     = useState(false);
  const [modalStep,     setModalStep]     = useState(1);
  const [form,          setForm]          = useState(emptyForm);
  const [formErrors,    setFormErrors]    = useState({});
  const [questions,     setQuestions]     = useState(makeQuiz());
  const [quizErrors,    setQuizErrors]    = useState({});
  const [coding,        setCoding]        = useState(makeCoding());
  const [codingErrors,  setCodingErrors]  = useState({});
  const [difficulty,    setDifficulty]    = useState(["Easy","Easy","Easy"]);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [historyJob,    setHistoryJob]    = useState(null);
  const [historyFilter, setHistoryFilter] = useState("All");
  const [selectedApp,   setSelectedApp]   = useState(null);
  const [portfolioStudent, setPortfolioStudent] = useState(null);
  const [pausedJobs,    setPausedJobs]    = useState(new Set());
  const [talentSearch,  setTalentSearch]  = useState("");
  const [talentSkill,   setTalentSkill]   = useState("");
  const [talentMin,     setTalentMin]     = useState(0);

  const togglePause = (id) => setPausedJobs(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });

  const hC  = (e)=>{ setForm({...form,[e.target.name]:e.target.value}); setFormErrors({...formErrors,[e.target.name]:""}); };
  const vS1 = ()=>{ const e={}; if(!form.title.trim())e.title="Required."; if(!form.experience.trim())e.experience="Required."; if(!form.salary.trim())e.salary="Required."; if(!form.description.trim())e.description="Required."; if(!form.skillsInput.trim())e.skillsInput="Required."; if(!form.daysLeft||isNaN(form.daysLeft)||Number(form.daysLeft)<1)e.daysLeft="Enter a valid number of days (min 1)."; return e; };
  const vQ  = ()=>{ const e={}; questions.forEach((q,qi)=>{ if(!q.question.trim())e[`q${qi}`]="Required."; q.options.forEach((o,oi)=>{ if(!o.trim())e[`q${qi}o${oi}`]="Required."; }); }); return e; };
  const vC  = ()=>{ const e={}; coding.forEach((c,ci)=>{ if(!c.title.trim())e[`c${ci}t`]="Required."; if(!c.problem.trim())e[`c${ci}p`]="Required."; if(!c.input.trim())e[`c${ci}i`]="Required."; if(!c.output.trim())e[`c${ci}o`]="Required."; }); return e; };

  const next1 = ()=>{ const e=vS1(); if(Object.keys(e).length){setFormErrors(e);return;} setModalStep(2); };
  const next2 = ()=>{ const e=vQ(); if(Object.keys(e).length){setQuizErrors(e);return;} setModalStep(3); };
  const post  = ()=>{ const e=vC(); if(Object.keys(e).length){setCodingErrors(e);return;}
    const j={id:Date.now(),title:form.title.trim(),experience:form.experience.trim(),salary:form.salary.trim(),description:form.description.trim(),skills:form.skillsInput.split(",").map(s=>s.trim()).filter(Boolean),languages:form.languagesInput?form.languagesInput.split(",").map(l=>l.trim()).filter(Boolean):[],daysLeft:Number(form.daysLeft),quiz:questions,coding:coding.map((c,i)=>({...c,difficulty:difficulty[i]}))};
    setJobs([...jobs,j]); closeModal(); setSuccessMsg(`"${j.title}" posted!`); setTimeout(()=>setSuccessMsg(""),4000);
  };
  const closeModal = ()=>{ setShowModal(false); setModalStep(1); setForm(emptyForm); setFormErrors({}); setQuestions(makeQuiz()); setQuizErrors({}); setCoding(makeCoding()); setCodingErrors({}); setDifficulty(["Easy","Easy","Easy"]); };

  const hQQ=(qi,v)=>{ const u=[...questions]; u[qi]={...u[qi],question:v}; setQuestions(u); };
  const hQO=(qi,oi,v)=>{ const u=[...questions]; const o=[...u[qi].options]; o[oi]=v; u[qi]={...u[qi],options:o}; setQuestions(u); };
  const hQA=(qi,oi)=>{ const u=[...questions]; u[qi]={...u[qi],correct:oi}; setQuestions(u); };
  const hCC=(ci,f,v)=>{ const u=[...coding]; u[ci]={...u[ci],[f]:v}; setCoding(u); };
  const hCD=(ci,v)=>{ const u=[...difficulty]; u[ci]=v; setDifficulty(u); };

  const openHistory  = (job)=>{ setHistoryJob(job); setHistoryFilter("All"); setSelectedApp(null); };
  const closeHistory = ()=>{ setHistoryJob(null); setSelectedApp(null); };
  const histData = historyJob?(jobHistory[historyJob.id]||[]):[];
  const filtered = historyFilter==="All"?histData:histData.filter(a=>a.status===historyFilter);

  const STATUS_CLS = {"Hired":"status-hired","In Review":"status-review","Rejected":"status-rejected"};

  return (
    <div className="landing-container">
      <aside className="sidebar">
        <div className="sidebar-logo"><img src="/logo.png" alt="SkilledLink" className="logo-img"/><span>SkilledLink</span></div>
        <div className="sidebar-divider"/>
        <nav className="sidebar-menu">
          <button className={activeTab==="dashboard"?"active":""} onClick={()=>setActiveTab("dashboard")}>Dashboard</button>
          <button className={activeTab==="hiring"?"active":""} onClick={()=>setActiveTab("hiring")}>Hiring</button>
          <button className={activeTab==="hired"?"active":""} onClick={()=>setActiveTab("hired")}>Hired</button>
          <button className={activeTab==="placements"?"active":""} onClick={()=>setActiveTab("placements")}>Placements</button>
          <button className={activeTab==="analytics"?"active":""} onClick={()=>setActiveTab("analytics")}>Analytics</button>
          <button className={activeTab==="talent"?"active":""} onClick={()=>setActiveTab("talent")}>Talent Pool</button>
        </nav>
        <button className="logout-btn" onClick={()=>navigate("/login/company")}>Log Out</button>
      </aside>

      <main className="main-content">
        {activeTab==="dashboard"&&(
          <div>
            {/* STATS CARDS */}
            {(()=>{
              const totalApplied   = Object.values(jobHistory).reduce((sum,arr)=>sum+arr.length,0);
              const totalHired     = Object.values(jobHistory).reduce((sum,arr)=>sum+arr.filter(a=>a.status==="Hired").length,0);
              const totalCompanies = 8;
              const totalJobs      = jobs.length;
              const stats = [
                {icon:"👨\u200d🎓", label:"Students Applied", value:totalApplied,   sub:"Total applicants"},
                {icon:"🏆",          label:"Students Hired",   value:totalHired,     sub:"Successfully placed"},
                {icon:"🏢",          label:"Companies",        value:totalCompanies, sub:"Partner companies"},
                {icon:"💼",          label:"Jobs Posted",      value:totalJobs,      sub:"Active positions"},
              ];
              return (
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"20px",marginBottom:"28px"}}>
                  {stats.map(({icon,label,value,sub})=>(
                    <div key={label} style={{
                      background:"linear-gradient(145deg,#ffffff,#faf8ff)",
                      border:"1.5px solid #e0d9f5",
                      borderRadius:"20px",
                      padding:"28px 24px",
                      display:"flex",flexDirection:"column",gap:"14px",
                      boxShadow:"0 8px 24px rgba(85,63,154,0.10)",
                      position:"relative",overflow:"hidden",
                    }}>
                      {/* decorative circle */}
                      <div style={{position:"absolute",top:"-18px",right:"-18px",width:"80px",height:"80px",borderRadius:"50%",background:"rgba(85,63,154,0.06)"}}/>
                      <div style={{position:"absolute",bottom:"-24px",right:"24px",width:"50px",height:"50px",borderRadius:"50%",background:"rgba(85,63,154,0.04)"}}/>

                      {/* icon bubble */}
                      <div style={{width:"48px",height:"48px",borderRadius:"14px",background:"linear-gradient(135deg,#ede8fb,#ddd5f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",boxShadow:"0 4px 10px rgba(85,63,154,0.15)"}}>
                        {icon}
                      </div>

                      {/* value + label */}
                      <div>
                        <div style={{fontSize:"38px",fontWeight:900,color:"#553f9a",lineHeight:1,letterSpacing:"-1px"}}>{value}</div>
                        <div style={{fontSize:"15px",fontWeight:700,color:"#2d1f6e",marginTop:"4px"}}>{label}</div>
                        <div style={{fontSize:"12px",color:"#9d8ec4",marginTop:"2px"}}>{sub}</div>
                      </div>

                      {/* bottom accent bar */}
                      <div style={{height:"3px",borderRadius:"3px",background:"#ede8fb",marginTop:"4px"}}>
                        <div style={{height:"100%",width:"55%",borderRadius:"3px",background:"linear-gradient(90deg,#553f9a,#8573cc)"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {/* TOP STUDENTS */}
            <div className="content-box"><h2>Top Students</h2>
              {students.map(s=>(
                <div key={s.id} className={`student-row rank-${s.id}`} style={{cursor:"pointer"}} onClick={()=>setPortfolioStudent(s)}>
                  <span className="rank">{s.id}</span><img src={s.img} alt={s.name}/>
                  <span className="name">{s.name}</span>
                  <span className="percentage">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==="hiring"&&(
          <div className="content-box"><h2>Open Positions</h2>
            {[...jobs].sort((a,b)=>pausedJobs.has(a.id)?1:pausedJobs.has(b.id)?-1:0).map(job=>{
              const paused = pausedJobs.has(job.id);
              return (
              <div key={job.id} className="job-card" style={{opacity:paused?0.55:1,background:paused?"#f5f5f7":"#fff",transition:"opacity 0.3s,background 0.3s",position:"relative"}}>
                {paused&&<div style={{position:"absolute",inset:0,borderRadius:"14px",background:"repeating-linear-gradient(135deg,transparent,transparent 8px,rgba(0,0,0,0.015) 8px,rgba(0,0,0,0.015) 16px)",pointerEvents:"none"}}/>}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"10px",marginBottom:"14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                    <h3 style={{margin:0,color:paused?"#999":"#553f9a"}}>{job.title}</h3>
                    {paused&&<span style={{background:"#e5e5ea",color:"#666",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>⏸ Paused</span>}
                  </div>
                  {!paused && job.daysLeft !== undefined && <DurationBadge daysLeft={job.daysLeft}/>}
                </div>
                <div className="job-meta"><span><strong>Experience:</strong> {job.experience}</span><span><strong>Salary:</strong> {job.salary}</span></div>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Skills:</strong> {job.skills.map((s,i)=><span key={i} className="tag">{s}</span>)}</p>
                {job.languages.length>0&&<p><strong>Languages:</strong> {job.languages.map((l,i)=><span key={i} className="tag">{l}</span>)}</p>}
                <div className="job-card-actions">
                  {!paused&&<button className="quiz-btn" onClick={()=>window.location.href="/quiz"}>Take Quiz</button>}
                  <button className="history-btn job-card-actions-right" onClick={()=>openHistory(job)}>
                    📋 History {(jobHistory[job.id]||[]).length>0&&<span className="history-count">{(jobHistory[job.id]||[]).length}</span>}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {activeTab==="hired"&&(
          <div className="content-box posted-jobs-box">
            <div className="hired-header">
              <div className="hired-title-group"><h2>All Posted Positions</h2><span className="jobs-count">{jobs.length}</span></div>
              <button className="hire-btn" onClick={()=>{setShowModal(true);setModalStep(1);}}>+ Hire</button>
            </div>
            {successMsg&&<div className="post-success">{successMsg}</div>}
            {[...jobs].sort((a,b)=>pausedJobs.has(a.id)?1:pausedJobs.has(b.id)?-1:0).map(job=>{
              const paused = pausedJobs.has(job.id);
              return (
              <div key={job.id} className="job-card" style={{opacity:paused?0.55:1,background:paused?"#f5f5f7":"#fff",transition:"opacity 0.3s,background 0.3s",position:"relative"}}>
                {paused&&<div style={{position:"absolute",inset:0,borderRadius:"14px",background:"repeating-linear-gradient(135deg,transparent,transparent 8px,rgba(0,0,0,0.015) 8px,rgba(0,0,0,0.015) 16px)",pointerEvents:"none"}}/>}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"10px",marginBottom:"14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                    <h3 style={{margin:0,color:paused?"#999":"#553f9a"}}>{job.title}</h3>
                    {paused&&<span style={{background:"#e5e5ea",color:"#666",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>⏸ Paused</span>}
                  </div>
                  {!paused && job.daysLeft !== undefined && <DurationBadge daysLeft={job.daysLeft}/>}
                </div>
                <div className="job-meta"><span><strong>Experience:</strong> {job.experience}</span><span><strong>Salary:</strong> {job.salary}</span></div>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Skills:</strong> {job.skills.map((s,i)=><span key={i} className="tag">{s}</span>)}</p>
                {job.languages.length>0&&<p><strong>Languages:</strong> {job.languages.map((l,i)=><span key={i} className="tag">{l}</span>)}</p>}
                <div className="job-badges">
                  {job.quiz&&<span className="quiz-badge">✅ {job.quiz.length} Quiz Qs</span>}
                  {job.coding&&<span className="coding-badge">💻 {job.coding.length} Coding Problems</span>}
                </div>
                <div className="job-card-actions">
                  <button className="delete-btn" onClick={()=>setJobs(jobs.filter(j=>j.id!==job.id))}>Remove Position</button>
                  <button
                    onClick={()=>togglePause(job.id)}
                    style={{padding:"12px 22px",fontSize:"16px",fontWeight:600,border:"none",borderRadius:"10px",cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit",
                      background:paused?"#553f9a":"#f3f0ff",
                      color:paused?"#fff":"#553f9a",
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(85,63,154,0.2)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
                  >
                    {paused?"▶ Resume":"⏸ Pause"}
                  </button>
                  <button className="history-btn job-card-actions-right" onClick={()=>openHistory(job)}>
                    📋 History {(jobHistory[job.id]||[]).length>0&&<span className="history-count">{(jobHistory[job.id]||[]).length}</span>}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {activeTab==="placements"&&(()=>{
          // Build a flat list of all hired students with their job info
          const allHired = [];
          Object.entries(jobHistory).forEach(([jobId, applicants]) => {
            const job = initialJobs.find(j=>j.id===Number(jobId));
            applicants.filter(a=>a.status==="Hired").forEach(a=>{
              allHired.push({...a, jobTitle: job?job.title:"Unknown Role", jobId: Number(jobId)});
            });
          });
          // Deduplicate by name — keep latest hire
          const seen = new Set();
          const unique = allHired.filter(a=>{ if(seen.has(a.name)) return false; seen.add(a.name); return true; });

          return (
            <div className="content-box">
              {/* Header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
                  <h2 style={{margin:0}}>Placed Students</h2>
                  <span style={{background:"linear-gradient(135deg,#553f9a,#7b5fc4)",color:"#fff",fontSize:"15px",fontWeight:700,padding:"4px 16px",borderRadius:"20px",boxShadow:"0 4px 10px rgba(85,63,154,0.3)"}}>{unique.length}</span>
                </div>
                <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1.5px solid #86efac",borderRadius:"12px",padding:"10px 20px",display:"flex",alignItems:"center",gap:"10px"}}>
                  <span style={{fontSize:"20px"}}>🎉</span>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:700,color:"#15803d"}}>{unique.length} students successfully placed</div>
                    <div style={{fontSize:"12px",color:"#4ade80"}}>Across {Object.keys(jobHistory).length} job positions</div>
                  </div>
                </div>
              </div>

              {/* Cards grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:"20px"}}>
                {unique.map((s,i)=>{
                  const port = STUDENT_PORTFOLIO[s.name];
                  return (
                    <div key={i} style={{
                      background:"linear-gradient(145deg,#ffffff,#faf8ff)",
                      border:"1.5px solid #e0d9f5",
                      borderRadius:"18px",
                      padding:"22px",
                      boxShadow:"0 6px 20px rgba(85,63,154,0.08)",
                      position:"relative",
                      overflow:"hidden",
                      transition:"transform 0.2s,box-shadow 0.2s",
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 14px 32px rgba(85,63,154,0.16)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 20px rgba(85,63,154,0.08)";}}>

                      {/* decorative bg circle */}
                      <div style={{position:"absolute",top:"-20px",right:"-20px",width:"90px",height:"90px",borderRadius:"50%",background:"rgba(85,63,154,0.05)"}}/>

                      {/* hired badge */}
                      <div style={{position:"absolute",top:"16px",right:"16px",background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"#fff",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px",boxShadow:"0 2px 8px rgba(22,163,74,0.3)"}}>✓ Hired</div>

                      {/* top row: avatar + name */}
                      <div style={{display:"flex",gap:"14px",alignItems:"center",marginBottom:"16px"}}>
                        <img src={s.img} alt={s.name} style={{width:"60px",height:"60px",borderRadius:"50%",objectFit:"cover",border:"3px solid #e0d9f5",boxShadow:"0 4px 12px rgba(85,63,154,0.15)",flexShrink:0}}/>
                        <div>
                          <div style={{fontSize:"17px",fontWeight:800,color:"#2d1f6e",marginBottom:"2px"}}>{s.name}</div>
                          <div style={{fontSize:"12px",color:"#9d8ec4",fontWeight:500}}>{port?`${port.degree} · ${port.college}`:"Student"}</div>
                          <div style={{fontSize:"12px",color:"#6b7280",marginTop:"2px"}}>📅 {s.date}</div>
                        </div>
                      </div>

                      {/* hired for */}
                      <div style={{background:"linear-gradient(135deg,#ede8fb,#e0d9f5)",borderRadius:"10px",padding:"10px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"8px"}}>
                        <span style={{fontSize:"16px"}}>💼</span>
                        <div>
                          <div style={{fontSize:"11px",color:"#9d8ec4",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>Hired For</div>
                          <div style={{fontSize:"14px",fontWeight:700,color:"#553f9a"}}>{s.jobTitle}</div>
                        </div>
                      </div>

                      {/* scores */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"14px"}}>
                        {[["📝 Quiz",s.quiz],["💻 Coding",s.coding]].map(([lbl,val])=>(
                          <div key={lbl} style={{background:"#f9f8ff",border:"1px solid #e0d9f5",borderRadius:"8px",padding:"8px 12px"}}>
                            <div style={{fontSize:"11px",color:"#9d8ec4",fontWeight:600,marginBottom:"4px"}}>{lbl}</div>
                            <div style={{fontSize:"18px",fontWeight:800,color:"#553f9a",lineHeight:1}}>{val}%</div>
                            <div style={{height:"3px",borderRadius:"3px",background:"#e0d9f5",marginTop:"6px"}}>
                              <div style={{height:"100%",width:`${val}%`,borderRadius:"3px",background:"linear-gradient(90deg,#553f9a,#8573cc)"}}/>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* skills */}
                      {port&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                          {port.skills.slice(0,4).map(sk=>(
                            <span key={sk} style={{background:"#f3f0ff",color:"#553f9a",fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"20px",border:"1px solid #e0d9f5"}}>{sk}</span>
                          ))}
                          {port.skills.length>4&&<span style={{background:"#f3f0ff",color:"#9d8ec4",fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"20px",border:"1px solid #e0d9f5"}}>+{port.skills.length-4} more</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}


        {activeTab==="analytics"&&(()=>{
          const P = "#553f9a"; const PL = "#8573cc"; const PLL = "#ede8fb";

          // ── compute data ──
          const allApps = Object.entries(jobHistory).flatMap(([jid,arr])=>arr.map(a=>({...a,jid:Number(jid)})));
          const hired   = allApps.filter(a=>a.status==="Hired");
          const review  = allApps.filter(a=>a.status==="In Review");
          const rejected= allApps.filter(a=>a.status==="Rejected");

          const hireRate = Math.round((hired.length/allApps.length)*100);
          const avgQuiz  = Math.round(allApps.reduce((s,a)=>s+a.quiz,0)/allApps.length);
          const avgCode  = Math.round(allApps.reduce((s,a)=>s+a.coding,0)/allApps.length);

          // per-job stats
          const jobStats = initialJobs.map(job=>{
            const apps = jobHistory[job.id]||[];
            const h    = apps.filter(a=>a.status==="Hired").length;
            const aq   = apps.length?Math.round(apps.reduce((s,a)=>s+a.quiz,0)/apps.length):0;
            const ac   = apps.length?Math.round(apps.reduce((s,a)=>s+a.coding,0)/apps.length):0;
            return {title:job.title,total:apps.length,hired:h,rate:apps.length?Math.round(h/apps.length*100):0,avgQuiz:aq,avgCode:ac};
          }).sort((a,b)=>b.total-a.total);

          // top scorers (avg of quiz+coding)
          const scorerMap = {};
          allApps.forEach(a=>{
            if(!scorerMap[a.name]) scorerMap[a.name]={name:a.name,img:a.img,total:0,count:0};
            scorerMap[a.name].total += (a.quiz+a.coding)/2;
            scorerMap[a.name].count += 1;
          });
          const topScorers = Object.values(scorerMap).map(s=>({...s,avg:Math.round(s.total/s.count)})).sort((a,b)=>b.avg-a.avg).slice(0,5);

          // score buckets for distribution
          const buckets = {"90–100":0,"80–89":0,"70–79":0,"60–69":0,"<60":0};
          allApps.forEach(a=>{
            const avg=(a.quiz+a.coding)/2;
            if(avg>=90) buckets["90–100"]++;
            else if(avg>=80) buckets["80–89"]++;
            else if(avg>=70) buckets["70–79"]++;
            else if(avg>=60) buckets["60–69"]++;
            else buckets["<60"]++;
          });
          const maxBucket = Math.max(...Object.values(buckets));

          const Card=({children,style={}})=>(
            <div style={{background:"linear-gradient(145deg,#ffffff,#faf8ff)",border:"1.5px solid #e0d9f5",borderRadius:"18px",padding:"24px",boxShadow:"0 6px 20px rgba(85,63,154,0.08)",...style}}>
              {children}
            </div>
          );
          const SectionTitle=({icon,title})=>(
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"18px"}}>
              <span style={{fontSize:"18px"}}>{icon}</span>
              <h3 style={{margin:0,fontSize:"16px",fontWeight:800,color:"#2d1f6e"}}>{title}</h3>
            </div>
          );

          return (
            <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

              {/* ── HEADER ── */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
                <div>
                  <h2 style={{margin:"0 0 4px",fontSize:"24px",fontWeight:800,color:"#2d1f6e"}}>Hiring Analytics</h2>
                  <p style={{margin:0,fontSize:"13px",color:"#9d8ec4"}}>Full overview of your recruitment pipeline performance</p>
                </div>
                <div style={{background:"linear-gradient(135deg,#553f9a,#7b5fc4)",color:"#fff",fontSize:"13px",fontWeight:600,padding:"8px 18px",borderRadius:"20px",boxShadow:"0 4px 14px rgba(85,63,154,0.3)"}}>
                  📊 {allApps.length} Total Applications
                </div>
              </div>

              {/* ── ROW 1: KPI CARDS ── */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px"}}>
                {[
                  {icon:"📥",label:"Total Applied",value:allApps.length,sub:"All applicants"},
                  {icon:"✅",label:"Hire Rate",value:`${hireRate}%`,sub:`${hired.length} of ${allApps.length} hired`},
                  {icon:"📝",label:"Avg Quiz Score",value:`${avgQuiz}%`,sub:"Across all applicants"},
                  {icon:"💻",label:"Avg Coding Score",value:`${avgCode}%`,sub:"Across all applicants"},
                ].map(({icon,label,value,sub})=>(
                  <div key={label} style={{background:"linear-gradient(145deg,#faf8ff,#f3f0ff)",border:"1.5px solid #e0d9f5",borderRadius:"16px",padding:"20px",boxShadow:"0 4px 14px rgba(85,63,154,0.08)",display:"flex",flexDirection:"column",gap:"6px",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:"-16px",right:"-16px",width:"64px",height:"64px",borderRadius:"50%",background:"rgba(85,63,154,0.05)"}}/>
                    <span style={{fontSize:"26px"}}>{icon}</span>
                    <span style={{fontSize:"30px",fontWeight:900,color:P,lineHeight:1,letterSpacing:"-1px"}}>{value}</span>
                    <span style={{fontSize:"13px",fontWeight:700,color:"#2d1f6e"}}>{label}</span>
                    <span style={{fontSize:"11px",color:"#9d8ec4"}}>{sub}</span>
                  </div>
                ))}
              </div>

              {/* ── ROW 2: FUNNEL + SCORE DISTRIBUTION ── */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>

                {/* Hiring Funnel */}
                <Card>
                  <SectionTitle icon="🔽" title="Hiring Funnel"/>
                  <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                    {[
                      {label:"Applied",count:allApps.length,color:"#553f9a",pct:100},
                      {label:"In Review",count:review.length+hired.length,color:"#7b5fc4",pct:Math.round((review.length+hired.length)/allApps.length*100)},
                      {label:"Hired",count:hired.length,color:"#22c55e",pct:Math.round(hired.length/allApps.length*100)},
                      {label:"Rejected",count:rejected.length,color:"#f87171",pct:Math.round(rejected.length/allApps.length*100)},
                    ].map(({label,count,color,pct})=>(
                      <div key={label}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                          <span style={{fontSize:"13px",fontWeight:600,color:"#444"}}>{label}</span>
                          <span style={{fontSize:"13px",fontWeight:700,color}}>{count} <span style={{color:"#bbb",fontWeight:400}}>({pct}%)</span></span>
                        </div>
                        <div style={{height:"10px",borderRadius:"10px",background:"#f0eeff"}}>
                          <div style={{height:"100%",width:`${pct}%`,borderRadius:"10px",background:color,transition:"width 0.5s"}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Score Distribution */}
                <Card>
                  <SectionTitle icon="📊" title="Score Distribution"/>
                  <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                    {Object.entries(buckets).map(([range,count])=>(
                      <div key={range} style={{display:"flex",alignItems:"center",gap:"12px"}}>
                        <span style={{fontSize:"12px",fontWeight:600,color:"#666",width:"54px",flexShrink:0}}>{range}</span>
                        <div style={{flex:1,height:"22px",borderRadius:"8px",background:"#f0eeff",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${maxBucket?Math.round(count/maxBucket*100):0}%`,background:"linear-gradient(90deg,#553f9a,#8573cc)",borderRadius:"8px",display:"flex",alignItems:"center",paddingLeft:"8px",minWidth:count>0?"32px":"0",transition:"width 0.5s"}}>
                            {count>0&&<span style={{fontSize:"11px",fontWeight:700,color:"#fff"}}>{count}</span>}
                          </div>
                        </div>
                        <span style={{fontSize:"12px",color:"#9d8ec4",width:"28px",textAlign:"right",flexShrink:0}}>{count}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{margin:"14px 0 0",fontSize:"12px",color:"#bbb",textAlign:"center"}}>Based on average (quiz + coding) scores</p>
                </Card>
              </div>

              {/* ── ROW 3: JOB PERFORMANCE TABLE ── */}
              <Card>
                <SectionTitle icon="💼" title="Job-wise Performance"/>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                    <thead>
                      <tr style={{borderBottom:"2px solid #e0d9f5"}}>
                        {["Job Title","Applicants","Hired","Hire Rate","Avg Quiz","Avg Coding","Performance"].map(h=>(
                          <th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:"#553f9a",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {jobStats.map((j,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid #f0eeff",background:i%2===0?"#faf8ff":"#ffffff"}}>
                          <td style={{padding:"12px 14px",fontWeight:600,color:"#2d1f6e"}}>{j.title}</td>
                          <td style={{padding:"12px 14px",color:"#555"}}>{j.total}</td>
                          <td style={{padding:"12px 14px"}}>
                            <span style={{background:"#dcfce7",color:"#16a34a",fontWeight:700,padding:"2px 10px",borderRadius:"20px",fontSize:"12px"}}>{j.hired}</span>
                          </td>
                          <td style={{padding:"12px 14px"}}>
                            <span style={{background:j.rate>=70?"#ede8fb":"#fff0f0",color:j.rate>=70?P:"#ef4444",fontWeight:700,padding:"2px 10px",borderRadius:"20px",fontSize:"12px"}}>{j.rate}%</span>
                          </td>
                          <td style={{padding:"12px 14px",color:"#555"}}>{j.avgQuiz}%</td>
                          <td style={{padding:"12px 14px",color:"#555"}}>{j.avgCode}%</td>
                          <td style={{padding:"12px 14px",minWidth:"100px"}}>
                            <div style={{height:"6px",borderRadius:"6px",background:"#e0d9f5"}}>
                              <div style={{height:"100%",width:`${j.rate}%`,borderRadius:"6px",background:`linear-gradient(90deg,${P},${PL})`}}/>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* ── ROW 4: TOP SCORERS ── */}
              <Card>
                <SectionTitle icon="🏆" title="Top 5 Performers (Avg Score)"/>
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  {topScorers.map((s,i)=>(
                    <div key={s.name} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 16px",background:i===0?"linear-gradient(135deg,#faf8ff,#ede8fb)":"#faf8ff",border:`1.5px solid ${i===0?"#c8b8f0":"#e0d9f5"}`,borderRadius:"12px"}}>
                      <span style={{fontSize:"18px",fontWeight:800,color:i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#b45309":"#9d8ec4",width:"24px",textAlign:"center"}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                      </span>
                      <img src={s.img} alt={s.name} style={{width:"42px",height:"42px",borderRadius:"50%",objectFit:"cover",border:"2px solid #e0d9f5",flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"14px",fontWeight:700,color:"#2d1f6e"}}>{s.name}</div>
                        <div style={{fontSize:"12px",color:"#9d8ec4"}}>{s.count} application{s.count>1?"s":""}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"22px",fontWeight:900,color:P,lineHeight:1}}>{s.avg}%</div>
                        <div style={{fontSize:"11px",color:"#bbb"}}>avg score</div>
                      </div>
                      <div style={{width:"80px"}}>
                        <div style={{height:"6px",borderRadius:"6px",background:"#e0d9f5"}}>
                          <div style={{height:"100%",width:`${s.avg}%`,borderRadius:"6px",background:"linear-gradient(90deg,#553f9a,#8573cc)"}}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          );
        })()}


        {activeTab==="talent"&&(()=>{
          const [search, setSearch] = [talentSearch, setTalentSearch];
          const [skillFilter, setSkillFilter] = [talentSkill, setTalentSkill];
          const [minScore, setMinScore] = [talentMin, setTalentMin];

          // all unique skills across all students
          const allSkills = [...new Set(Object.values(STUDENT_PORTFOLIO).flatMap(p=>p.skills))].sort();

          // build enriched student list
          const enriched = students.map(s => {
            const port = STUDENT_PORTFOLIO[s.name];
            const apps = Object.values(jobHistory).flatMap(arr=>arr).filter(a=>a.name===s.name);
            const hired = apps.filter(a=>a.status==="Hired").length;
            const avgScore = apps.length ? Math.round(apps.reduce((sum,a)=>(sum+(a.quiz+a.coding)/2),0)/apps.length) : s.percentage;
            return {...s, port, apps:apps.length, hired, avgScore};
          });

          const filtered = enriched.filter(s => {
            const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
              (s.port && (s.port.college.toLowerCase().includes(search.toLowerCase()) ||
              s.port.degree.toLowerCase().includes(search.toLowerCase())));
            const matchSkill = !skillFilter || (s.port && s.port.skills.includes(skillFilter));
            const matchScore = s.avgScore >= minScore;
            return matchSearch && matchSkill && matchScore;
          });

          return (
            <div style={{display:"flex",flexDirection:"column",gap:"22px"}}>

              {/* Header */}
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
                <div>
                  <h2 style={{margin:"0 0 4px",fontSize:"24px",fontWeight:800,color:"#2d1f6e"}}>Talent Pool</h2>
                  <p style={{margin:0,fontSize:"13px",color:"#9d8ec4"}}>Browse, filter and shortlist top candidates proactively</p>
                </div>
                <div style={{background:"linear-gradient(135deg,#553f9a,#7b5fc4)",color:"#fff",fontSize:"13px",fontWeight:600,padding:"8px 18px",borderRadius:"20px",boxShadow:"0 4px 14px rgba(85,63,154,0.3)"}}>
                  👥 {filtered.length} / {enriched.length} Students
                </div>
              </div>

              {/* ── FILTERS ── */}
              <div style={{background:"linear-gradient(145deg,#ffffff,#faf8ff)",border:"1.5px solid #e0d9f5",borderRadius:"16px",padding:"20px 24px",display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-end",boxShadow:"0 4px 14px rgba(85,63,154,0.07)"}}>
                {/* Search */}
                <div style={{flex:"2",minWidth:"200px"}}>
                  <label style={{fontSize:"12px",fontWeight:700,color:"#553f9a",display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.4px"}}>🔍 Search</label>
                  <input
                    value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Name, college, degree..."
                    style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e0d9f5",borderRadius:"10px",fontSize:"14px",outline:"none",fontFamily:"inherit",color:"#2d1f6e",background:"#fff",boxSizing:"border-box"}}
                    onFocus={e=>e.target.style.borderColor="#553f9a"}
                    onBlur={e=>e.target.style.borderColor="#e0d9f5"}
                  />
                </div>
                {/* Skill filter */}
                <div style={{flex:"2",minWidth:"180px"}}>
                  <label style={{fontSize:"12px",fontWeight:700,color:"#553f9a",display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.4px"}}>🛠️ Skill</label>
                  <select
                    value={skillFilter} onChange={e=>setSkillFilter(e.target.value)}
                    style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e0d9f5",borderRadius:"10px",fontSize:"14px",outline:"none",fontFamily:"inherit",color:"#2d1f6e",background:"#fff",cursor:"pointer"}}
                  >
                    <option value="">All Skills</option>
                    {allSkills.map(sk=><option key={sk} value={sk}>{sk}</option>)}
                  </select>
                </div>
                {/* Min score */}
                <div style={{flex:"2",minWidth:"180px"}}>
                  <label style={{fontSize:"12px",fontWeight:700,color:"#553f9a",display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.4px"}}>⭐ Min Score: {minScore}%</label>
                  <input
                    type="range" min="0" max="100" value={minScore} onChange={e=>setMinScore(Number(e.target.value))}
                    style={{width:"100%",accentColor:"#553f9a",cursor:"pointer"}}
                  />
                </div>
                {/* Clear */}
                <button
                  onClick={()=>{setSearch("");setSkillFilter("");setMinScore(0);}}
                  style={{padding:"10px 20px",background:"#f3f0ff",color:"#553f9a",border:"1.5px solid #e0d9f5",borderRadius:"10px",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}
                  onMouseEnter={e=>e.currentTarget.style.background="#ede8fb"}
                  onMouseLeave={e=>e.currentTarget.style.background="#f3f0ff"}
                >Clear</button>
              </div>

              {/* ── STUDENT CARDS GRID ── */}
              {filtered.length===0?(
                <div style={{textAlign:"center",padding:"60px 20px",color:"#9d8ec4",fontSize:"16px"}}>
                  <div style={{fontSize:"48px",marginBottom:"12px"}}>🔍</div>
                  No students match your filters
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:"18px"}}>
                  {filtered.map(s=>{
                    const statusColor = s.hired>0?"#16a34a":s.apps>0?"#b45309":"#6b7280";
                    const statusBg    = s.hired>0?"#dcfce7":s.apps>0?"#fef9c3":"#f1f5f9";
                    const statusLabel = s.hired>0?`✓ Hired (${s.hired}×)`:s.apps>0?"In Pipeline":"Not Applied";
                    return (
                      <div key={s.id}
                        style={{background:"linear-gradient(145deg,#ffffff,#faf8ff)",border:"1.5px solid #e0d9f5",borderRadius:"18px",padding:"20px",boxShadow:"0 5px 16px rgba(85,63,154,0.07)",position:"relative",overflow:"hidden",transition:"transform 0.2s,box-shadow 0.2s",cursor:"pointer"}}
                        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 14px 32px rgba(85,63,154,0.15)";}}
                        onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 5px 16px rgba(85,63,154,0.07)";}}
                        onClick={()=>setPortfolioStudent(s)}
                      >
                        {/* decorative blob */}
                        <div style={{position:"absolute",top:"-22px",right:"-22px",width:"80px",height:"80px",borderRadius:"50%",background:"rgba(85,63,154,0.05)"}}/>

                        {/* status pill */}
                        <span style={{position:"absolute",top:"14px",right:"14px",background:statusBg,color:statusColor,fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>{statusLabel}</span>

                        {/* avatar + name */}
                        <div style={{display:"flex",gap:"14px",alignItems:"center",marginBottom:"14px"}}>
                          <div style={{position:"relative",flexShrink:0}}>
                            <img src={s.img} alt={s.name} style={{width:"58px",height:"58px",borderRadius:"50%",objectFit:"cover",border:"3px solid #e0d9f5",boxShadow:"0 4px 10px rgba(85,63,154,0.12)"}}/>
                            <span style={{position:"absolute",bottom:"-2px",right:"-2px",background:"linear-gradient(135deg,#553f9a,#7b5fc4)",color:"#fff",fontSize:"10px",fontWeight:800,width:"20px",height:"20px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>#{s.id}</span>
                          </div>
                          <div>
                            <div style={{fontSize:"16px",fontWeight:800,color:"#2d1f6e"}}>{s.name}</div>
                            {s.port&&<div style={{fontSize:"12px",color:"#9d8ec4",marginTop:"2px"}}>{s.port.degree} · {s.port.college}</div>}
                            {s.port&&<div style={{fontSize:"12px",color:"#bbb",marginTop:"1px"}}>Batch {s.port.year}</div>}
                          </div>
                        </div>

                        {/* score bars */}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"14px"}}>
                          {[["⭐ Overall",s.percentage],["📊 Avg Score",s.avgScore]].map(([lbl,val])=>(
                            <div key={lbl} style={{background:"#f3f0ff",borderRadius:"10px",padding:"8px 10px"}}>
                              <div style={{fontSize:"10px",color:"#9d8ec4",fontWeight:600,marginBottom:"4px"}}>{lbl}</div>
                              <div style={{fontSize:"18px",fontWeight:900,color:"#553f9a",lineHeight:1}}>{val}%</div>
                              <div style={{height:"3px",borderRadius:"3px",background:"#e0d9f5",marginTop:"5px"}}>
                                <div style={{height:"100%",width:`${val}%`,borderRadius:"3px",background:"linear-gradient(90deg,#553f9a,#8573cc)"}}/>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* skills */}
                        {s.port&&(
                          <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"12px"}}>
                            {s.port.skills.slice(0,4).map(sk=>(
                              <span key={sk} style={{background: skillFilter===sk?"#553f9a":"#f3f0ff", color:skillFilter===sk?"#fff":"#553f9a",fontSize:"11px",fontWeight:600,padding:"3px 9px",borderRadius:"20px",border:"1px solid #e0d9f5"}}>{sk}</span>
                            ))}
                            {s.port.skills.length>4&&<span style={{background:"#f3f0ff",color:"#9d8ec4",fontSize:"11px",padding:"3px 9px",borderRadius:"20px",border:"1px solid #e0d9f5"}}>+{s.port.skills.length-4}</span>}
                          </div>
                        )}

                        {/* footer */}
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:"10px",borderTop:"1px solid #f0eeff"}}>
                          <span style={{fontSize:"12px",color:"#9d8ec4"}}>{s.apps} application{s.apps!==1?"s":""}</span>
                          <span style={{fontSize:"12px",fontWeight:700,color:"#553f9a"}}>View Portfolio →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

      </main>

      {/* HIRE MODAL */}
      {showModal&&(
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{modalStep===1?"Post a New Position":modalStep===2?"Add Quiz Questions":"Add Coding Round"}</h2>
                <div className="modal-steps">
                  {[1,2,3].map((s,i)=>(
                    <span key={s} style={{display:"flex",alignItems:"center",gap:6}}>
                      <span className={`step-dot ${modalStep>=s?"active":""}`}>{s}</span>
                      {i<2&&<span className={`step-line ${modalStep>s?"step-line-done":""}`}/>}
                    </span>
                  ))}
                  <div className="step-labels">{["Job Details","Quiz Questions","Coding Round"].map(l=><span key={l}>{l}</span>)}</div>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {modalStep===1&&(<>
              <p className="post-job-sub">Fill in the job details.</p>
              <div className="post-job-grid">
                <div className="post-field"><label>Job Title <span className="req">*</span></label><input name="title" placeholder="e.g. Frontend Developer" value={form.title} onChange={hC} className={formErrors.title?"input-error":""}/>{formErrors.title&&<span className="field-error">{formErrors.title}</span>}</div>
                <div className="post-field"><label>Experience <span className="req">*</span></label><input name="experience" placeholder="e.g. 0–2 Years" value={form.experience} onChange={hC} className={formErrors.experience?"input-error":""}/>{formErrors.experience&&<span className="field-error">{formErrors.experience}</span>}</div>
                <div className="post-field"><label>Salary <span className="req">*</span></label><input name="salary" placeholder="e.g. ₹4–₹6 LPA" value={form.salary} onChange={hC} className={formErrors.salary?"input-error":""}/>{formErrors.salary&&<span className="field-error">{formErrors.salary}</span>}</div>
                <div className="post-field"><label>Skills <span className="req">*</span></label><input name="skillsInput" placeholder="e.g. React, Node.js" value={form.skillsInput} onChange={hC} className={formErrors.skillsInput?"input-error":""}/>{formErrors.skillsInput&&<span className="field-error">{formErrors.skillsInput}</span>}</div>
                <div className="post-field"><label>Languages</label><input name="languagesInput" placeholder="e.g. JavaScript" value={form.languagesInput} onChange={hC}/></div>
                <div className="post-field">
                  <label>Open for <span className="req">*</span> <span className="hint">(days students can apply)</span></label>
                  <input name="daysLeft" type="number" min="1" placeholder="e.g. 14" value={form.daysLeft} onChange={hC} className={formErrors.daysLeft?"input-error":""}/>
                  {formErrors.daysLeft&&<span className="field-error">{formErrors.daysLeft}</span>}
                </div>
              </div>
              <div className="post-field post-field-full"><label>Description <span className="req">*</span></label><textarea name="description" placeholder="Describe the role..." value={form.description} onChange={hC} rows={4} className={formErrors.description?"input-error":""}/>{formErrors.description&&<span className="field-error">{formErrors.description}</span>}</div>
              <div className="modal-footer"><button className="cancel-btn" onClick={closeModal}>Cancel</button><button className="post-btn" onClick={next1}>Next: Quiz Questions →</button></div>
            </>)}

            {modalStep===2&&(<>
              <p className="post-job-sub">Add 20 MCQ questions.</p>
              <div className="quiz-questions-list">
                {questions.map((q,qi)=>(
                  <div key={qi} className="quiz-q-card" id={`q${qi}`}>
                    <div className="quiz-q-header"><span className="quiz-q-number">Q{qi+1}</span></div>
                    <input className={`quiz-q-input ${quizErrors[`q${qi}`]?"input-error":""}`} placeholder={`Question ${qi+1}...`} value={q.question} onChange={e=>hQQ(qi,e.target.value)}/>
                    <div className="quiz-options">{q.options.map((opt,oi)=>(
                      <div key={oi} className={`quiz-option-row ${q.correct===oi?"correct-option":""}`}>
                        <input type="radio" name={`c-${qi}`} checked={q.correct===oi} onChange={()=>hQA(qi,oi)}/>
                        <span className="option-letter">{["A","B","C","D"][oi]}</span>
                        <input className="option-text-input" placeholder={`Option ${["A","B","C","D"][oi]}`} value={opt} onChange={e=>hQO(qi,oi,e.target.value)}/>
                        {q.correct===oi&&<span className="correct-badge">✓ Correct</span>}
                      </div>
                    ))}</div>
                  </div>
                ))}
              </div>
              <div className="modal-footer"><button className="cancel-btn" onClick={()=>setModalStep(1)}>← Back</button><button className="post-btn" onClick={next2}>Next: Coding Round →</button></div>
            </>)}

            {modalStep===3&&(<>
              <p className="post-job-sub">Add 3 coding problems.</p>
              <div className="coding-questions-list">
                {coding.map((c,ci)=>(
                  <div key={ci} className="coding-q-card">
                    <div className="coding-q-header"><span className="coding-q-number">Problem {ci+1}</span><div className="difficulty-selector">{DIFF.map(d=><button key={d} type="button" className={`diff-btn diff-${d.toLowerCase()} ${difficulty[ci]===d?"diff-active":""}`} onClick={()=>hCD(ci,d)}>{d}</button>)}</div></div>
                    <div className="coding-field"><label>Title <span className="req">*</span></label><input placeholder="e.g. Two Sum" value={c.title} onChange={e=>hCC(ci,"title",e.target.value)}/></div>
                    <div className="coding-field"><label>Problem Statement <span className="req">*</span></label><textarea placeholder="Describe..." value={c.problem} rows={3} onChange={e=>hCC(ci,"problem",e.target.value)}/></div>
                    <div className="coding-io-grid">
                      <div className="coding-field"><label>Input <span className="req">*</span></label><textarea placeholder="Expected input" rows={2} value={c.input} onChange={e=>hCC(ci,"input",e.target.value)}/></div>
                      <div className="coding-field"><label>Output <span className="req">*</span></label><textarea placeholder="Expected output" rows={2} value={c.output} onChange={e=>hCC(ci,"output",e.target.value)}/></div>
                    </div>
                    <div className="coding-field"><label>Hint (optional)</label><input placeholder="Hint..." value={c.hint} onChange={e=>hCC(ci,"hint",e.target.value)}/></div>
                  </div>
                ))}
              </div>
              <div className="modal-footer"><button className="cancel-btn" onClick={()=>setModalStep(2)}>← Back</button><button className="post-btn" onClick={post}>Post Position</button></div>
            </>)}
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {historyJob&&!selectedApp&&(
        <div className="modal-overlay" onClick={closeHistory}>
          <div className="modal-box history-modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><h2>Applicant History</h2><p className="history-subtitle"><strong>{historyJob.title}</strong> · {histData.length} applicants</p></div>
              <button className="modal-close" onClick={closeHistory}>✕</button>
            </div>
            <div className="history-summary">
              {["All","Hired","In Review","Rejected"].map(f=>{
                const cnt=f==="All"?histData.length:histData.filter(a=>a.status===f).length;
                return <button key={f} className={`history-filter-btn hf-${f.replace(" ","-").toLowerCase()} ${historyFilter===f?"hf-active":""}`} onClick={()=>setHistoryFilter(f)}>{f} <span className="hf-count">{cnt}</span></button>;
              })}
            </div>
            {filtered.length===0?<div className="history-empty">No applicants.</div>:
              <div className="history-list">
                {filtered.map((a,i)=>(
                  <div key={i} className="history-row history-row-clickable" onClick={()=>setSelectedApp(a)}>
                    <img src={a.img} alt={a.name} className="history-avatar"/>
                    <div className="history-info">
                      <div className="history-name-row"><span className="history-name">{a.name}</span><span className={`history-status ${STATUS_CLS[a.status]}`}>{a.status}</span></div>
                      <span className="history-date">Applied: {a.date}</span>
                      <div className="history-scores"><ScoreBar label="Quiz Score" value={a.quiz}/><ScoreBar label="Coding Score" value={a.coding}/></div>
                    </div>
                    <span className="history-row-arrow">›</span>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      )}

      {selectedApp&&(
        <StudentDetailModal applicant={selectedApp} onBack={()=>setSelectedApp(null)} onClose={closeHistory}/>
      )}

      {portfolioStudent&&(
        <PortfolioModal student={portfolioStudent} onClose={()=>setPortfolioStudent(null)}/>
      )}

    </div>
  );
};

export default Landing;