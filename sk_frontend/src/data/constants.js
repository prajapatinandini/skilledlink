// data/constants.js

export const QUIZ_QS = [
  { q: "What does HTML stand for?", options: ["HyperText Markup Language","HighText Machine Language","HyperText Machine Language","Hyper Transfer Markup Language"], correct: 0 },
  { q: "Which CSS property controls text size?", options: ["font-weight","text-size","font-size","text-style"], correct: 2 },
  { q: "Which hook manages state in React?", options: ["useEffect","useRef","useContext","useState"], correct: 3 },
  { q: "What does API stand for?", options: ["Application Programming Interface","Applied Program Index","App Protocol Interface","Application Process Integration"], correct: 0 },
  { q: "What does REST stand for?", options: ["Remote Execution State Transfer","Representational State Transfer","React Extended State Tool","None of the above"], correct: 1 },
];

export const CODING_QS = [
  { title: "Two Sum", difficulty: "Easy", problem: "Given an array of integers, return indices of two numbers that add up to a target.", input: "nums=[2,7,11,15], target=9", output: "[0,1]" },
  { title: "Reverse String", difficulty: "Easy", problem: "Write a function to reverse a string in-place.", input: 's=["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
  { title: "Longest Substring", difficulty: "Medium", problem: "Find the length of the longest substring without repeating characters.", input: 's="abcabcbb"', output: "3" },
];

export const STUDENT_INFO = {
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

export const STUDENT_PORTFOLIO = {
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

export const students = [
  { id:1,  name:"Aarav Sharma",  img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=10)", percentage:98 },
  { id:2,  name:"Riya Patel",    img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=11)", percentage:95 },
  { id:3,  name:"Kunal Mehta",   img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=12)", percentage:92 },
  { id:4,  name:"Ananya Verma",  img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=13)", percentage:89 },
  { id:5,  name:"Rahul Singh",   img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=14)", percentage:86 },
  { id:6,  name:"Sneha Iyer",    img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=15)", percentage:83 },
  { id:7,  name:"Dev Malhotra",  img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=16)", percentage:80 },
  { id:8,  name:"Pooja Nair",    img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=17)", percentage:77 },
  { id:9,  name:"Aditya Joshi",  img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=18)", percentage:74 },
  { id:10, name:"Neha Kapoor",   img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=19)", percentage:71 },
];

export const jobHistory = {
  1:[{name:"Aarav Sharma",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=10)",date:"Mar 01, 2026",quiz:92,coding:88,status:"Hired"},{name:"Riya Patel",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=11)",date:"Mar 02, 2026",quiz:85,coding:79,status:"In Review"},{name:"Dev Malhotra",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=16)",date:"Mar 03, 2026",quiz:70,coding:60,status:"Rejected"},{name:"Pooja Nair",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=17)",date:"Mar 04, 2026",quiz:88,coding:82,status:"In Review"},{name:"Neha Kapoor",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=19)",date:"Mar 05, 2026",quiz:55,coding:48,status:"Rejected"}],
  2:[{name:"Kunal Mehta",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=12)",date:"Feb 25, 2026",quiz:90,coding:94,status:"Hired"},{name:"Rahul Singh",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=14)",date:"Feb 26, 2026",quiz:80,coding:75,status:"In Review"},{name:"Aditya Joshi",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=18)",date:"Feb 27, 2026",quiz:65,coding:58,status:"Rejected"},{name:"Sneha Iyer",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=15)",date:"Feb 28, 2026",quiz:87,coding:83,status:"In Review"}],
  3:[{name:"Ananya Verma",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=13)",date:"Mar 01, 2026",quiz:95,coding:91,status:"Hired"},{name:"Aarav Sharma",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=10)",date:"Mar 02, 2026",quiz:88,coding:84,status:"In Review"},{name:"Riya Patel",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=11)",date:"Mar 03, 2026",quiz:76,coding:70,status:"Rejected"},{name:"Kunal Mehta",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=12)",date:"Mar 04, 2026",quiz:91,coding:89,status:"Hired"},{name:"Pooja Nair",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=17)",date:"Mar 05, 2026",quiz:62,coding:55,status:"Rejected"},{name:"Dev Malhotra",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=16)",date:"Mar 06, 2026",quiz:78,coding:72,status:"In Review"}],
  4:[{name:"Sneha Iyer",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=15)",date:"Feb 20, 2026",quiz:89,coding:85,status:"Hired"},{name:"Neha Kapoor",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=19)",date:"Feb 21, 2026",quiz:72,coding:66,status:"Rejected"},{name:"Ananya Verma",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=13)",date:"Feb 22, 2026",quiz:84,coding:80,status:"In Review"}],
  5:[{name:"Rahul Singh",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=14)",date:"Feb 18, 2026",quiz:86,coding:80,status:"Hired"},{name:"Aditya Joshi",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=18)",date:"Feb 19, 2026",quiz:74,coding:68,status:"In Review"},{name:"Neha Kapoor",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=19)",date:"Feb 20, 2026",quiz:60,coding:52,status:"Rejected"},{name:"Riya Patel",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=11)",date:"Feb 21, 2026",quiz:91,coding:87,status:"Hired"}],
  6:[{name:"Kunal Mehta",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=12)",date:"Feb 10, 2026",quiz:93,coding:90,status:"Hired"},{name:"Dev Malhotra",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=16)",date:"Feb 11, 2026",quiz:78,coding:74,status:"In Review"},{name:"Rahul Singh",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=14)",date:"Feb 12, 2026",quiz:66,coding:60,status:"Rejected"}],
  7:[{name:"Aarav Sharma",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=10)",date:"Feb 05, 2026",quiz:97,coding:93,status:"Hired"},{name:"Pooja Nair",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=17)",date:"Feb 06, 2026",quiz:80,coding:76,status:"In Review"},{name:"Sneha Iyer",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=15)",date:"Feb 07, 2026",quiz:69,coding:61,status:"Rejected"},{name:"Ananya Verma",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=13)",date:"Feb 08, 2026",quiz:88,coding:84,status:"In Review"},{name:"Aditya Joshi",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=18)",date:"Feb 09, 2026",quiz:75,coding:69,status:"In Review"}],
  8:[{name:"Neha Kapoor",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=19)",date:"Jan 28, 2026",quiz:82,coding:77,status:"Hired"},{name:"Riya Patel",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=11)",date:"Jan 29, 2026",quiz:90,coding:86,status:"Hired"},{name:"Dev Malhotra",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=16)",date:"Jan 30, 2026",quiz:58,coding:50,status:"Rejected"}],
  9:[{name:"Ananya Verma",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=13)",date:"Jan 20, 2026",quiz:94,coding:92,status:"Hired"},{name:"Kunal Mehta",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=12)",date:"Jan 21, 2026",quiz:87,coding:83,status:"In Review"},{name:"Rahul Singh",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=14)",date:"Jan 22, 2026",quiz:70,coding:64,status:"Rejected"},{name:"Aarav Sharma",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=10)",date:"Jan 23, 2026",quiz:96,coding:95,status:"Hired"}],
  10:[{name:"Sneha Iyer",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=15)",date:"Jan 15, 2026",quiz:88,coding:85,status:"Hired"},{name:"Aditya Joshi",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=18)",date:"Jan 16, 2026",quiz:73,coding:67,status:"In Review"},{name:"Pooja Nair",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=17)",date:"Jan 17, 2026",quiz:61,coding:55,status:"Rejected"},{name:"Neha Kapoor",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=19)",date:"Jan 18, 2026",quiz:79,coding:74,status:"In Review"},{name:"Dev Malhotra",img:"[i.pravatar.cc](https://i.pravatar.cc/100?img=16)",date:"Jan 19, 2026",quiz:85,coding:81,status:"Hired"}],
};

export const initialJobs = [
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

export const DIFF = ["Easy", "Medium", "Hard"];

export const STATUS_CLS = {
  "Hired": "status-hired",
  "In Review": "status-review",
  "Rejected": "status-rejected"
};
