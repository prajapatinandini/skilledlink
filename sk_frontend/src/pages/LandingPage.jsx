import { useState, useEffect, useRef } from "react";
import "../styles/landingPage.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─── Data ───────────────────────────────────────────── */
const students = [
  { rank: 1, name: "Aarav Sharma",  score: 98, role: "Full Stack Dev"  },
  { rank: 2, name: "Riya Patel",    score: 95, role: "UI/UX Designer"  },
  { rank: 3, name: "Kunal Mehta",   score: 92, role: "Data Scientist"  },
  { rank: 4, name: "Ananya Verma",  score: 89, role: "ML Engineer"     },
  { rank: 5, name: "Rahul Singh",   score: 86, role: "Backend Dev"     },
  { rank: 6, name: "Sneha Iyer",    score: 83, role: "DevOps Engineer" },
];

const steps = [
  { n: "1", title: "Create Your Profile",    desc: "Sign up as a student or company and set up your profile in under 2 minutes." },
  { n: "2", title: "Take Skill Assessments", desc: "Attempt AI-powered quizzes across 200+ skill tracks to get your verified score." },
  { n: "3", title: "Get Hired",              desc: "Top-ranked students get discovered by 500+ partner companies actively hiring." },
];

const features = [
  { icon: "⚡", title: "AI-Powered Quizzes",    desc: "Timed, adaptive assessments that measure real competence — not just memory." },
  { icon: "🏆", title: "Live Leaderboards",      desc: "Compete globally. Your rank updates in real-time as you complete assessments." },
  { icon: "🎯", title: "Smart Job Matching",     desc: "Companies search for candidates by skill score, not just resume keywords." },
  { icon: "✅", title: "Verified Certificates",  desc: "Earn badges trusted by 500+ hiring companies to validate your skills." },
];

const studentPerks = [
  "Free skill assessments across 200+ topics",
  "Live leaderboard ranking visible to employers",
  "Verified badges & downloadable certificates",
  "Direct hiring by partner companies",
];

const companyPerks = [
  "Browse pre-vetted, skill-ranked candidates",
  "Filter talent by score, domain & location",
  "Post jobs & manage applications in one place",
  "Real-time hiring pipeline dashboard",
];

// ✅ Naya Pricing Data (Student aur Company dono ke liye)
const studentPlans = [
  {
    name: "Student Basic",
    price: "Free",
    desc: "Perfect for getting started and practicing.",
    features: ["1 Free Assessment / month", "Basic Leaderboard Rank", "Community Support"],
    btnText: "Get Started Free",
    btnClass: "sl-btn-outline-purple",
    link: "/register/student"
  },
  {
    name: "Starter Pack",
    price: "₹99",
    desc: "For serious students wanting to get hired faster.",
    features: ["100 Assessment Credits", "AI-Proctored Exams", "Verified Badge on Profile", "Priority Job Matching"],
    btnText: "Buy Starter Pack",
    btnClass: "sl-cta-primary",
    isPopular: true,
    link: "/login/student" 
  },
  {
    name: "Pro Pack",
    price: "₹199",
    desc: "For tech ninjas wanting unlimited access.",
    features: ["250 Assessment Credits", "Advanced Project Evaluation", "Direct Recruiter Messages", "Resume Highlighting"],
    btnText: "Buy Pro Pack",
    btnClass: "sl-btn-outline-purple",
    link: "/login/student"
  }
];

const companyPlans = [
  {
    name: "Basic Recruiter",
    price: "Free",
    desc: "For small startups testing the waters.",
    features: ["Post 1 Active Job", "View Public Leaderboards", "Standard Support"],
    btnText: "Start Hiring Free",
    btnClass: "sl-btn-outline-purple",
    link: "/register/company"
  },
  {
    name: "Growth Tier",
    price: "₹1,499",
    duration: "/mo",
    desc: "For growing companies actively hiring talent.",
    features: ["Post up to 5 Jobs", "Access Top 10% Candidates", "Direct Messaging (50/mo)", "AI Candidate Matching"],
    btnText: "Upgrade to Growth",
    btnClass: "sl-cta-primary", 
    isPopular: true,
    link: "/login/company" 
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    duration: "/mo",
    desc: "For bulk hiring and unlimited access.",
    features: ["Unlimited Job Posts", "Full Database Access", "Unlimited Direct Messaging", "Dedicated Account Manager"],
    btnText: "Contact Sales",
    btnClass: "sl-btn-outline-purple",
    link: "/login/company"
  }
];

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "Leaderboard", id: "leaderboard" },
  { label: "For Companies", id: "audience" },
  { label: "Pricing", id: "pricing" }
];

const AVATAR_COLORS = ["#4a27a0", "#6544bf", "#8268d4", "#5c35b5", "#3b1f85", "#7b5dc9"];

/* ─── Avatar ─────────────────────────────────────────── */
function Avatar({ name, size = 38 }) {
  const initials = name.split(" ").map((n) => n[0]).join("");
  const color    = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className="sl-rank-avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.34 }}>
      {initials}
    </div>
  );
}

/* ─── Hero Illustration ─── */
function HeroIllustration() {
  return (
    <svg viewBox="0 0 280 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <circle cx="140" cy="148" r="100" fill="rgba(255,255,255,0.06)" />
      <circle cx="140" cy="148" r="68"  fill="rgba(255,255,255,0.06)" />
      <ellipse cx="82" cy="228" rx="28" ry="7" fill="rgba(0,0,0,0.12)" />
      <rect x="60" y="168" width="44" height="58" rx="14" fill="rgba(255,255,255,0.88)" />
      <rect x="72" y="178" width="20" height="3" rx="1.5" fill="#c4b5fd" />
      <rect x="72" y="184" width="14" height="3" rx="1.5" fill="#c4b5fd" />
      <rect x="78" y="158" width="8" height="12" rx="4" fill="#f4c2a1" />
      <circle cx="82" cy="148" r="18" fill="#f4c2a1" />
      <path d="M64 144 Q64 126 82 126 Q100 126 100 144" fill="#2d1a6e" />
      <circle cx="76" cy="146" r="2" fill="#2d1a6e" />
      <circle cx="88" cy="146" r="2" fill="#2d1a6e" />
      <path d="M76 154 Q82 158 88 154" stroke="#2d1a6e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="52" y="210" width="60" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="56" y="192" width="52" height="20" rx="4" fill="rgba(255,255,255,0.4)" />
      <rect x="59" y="195" width="46" height="14" rx="2" fill="#ede8fb" opacity="0.7" />
      <rect x="58" y="240" width="48" height="16" rx="8" fill="rgba(255,255,255,0.2)" />
      <text x="82" y="252" fontSize="8" fontWeight="600" fill="white" textAnchor="middle" fontFamily="Poppins,sans-serif">Student</text>
      <line x1="114" y1="185" x2="166" y2="185" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="5 4" />
      <circle cx="140" cy="185" r="18" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <text x="140" y="190" fontSize="14" textAnchor="middle" fill="white" fontFamily="Poppins,sans-serif">🔗</text>
      <polygon points="118,182 112,185 118,188" fill="rgba(255,255,255,0.4)" />
      <polygon points="162,182 168,185 162,188" fill="rgba(255,255,255,0.4)" />
      <ellipse cx="198" cy="228" rx="28" ry="7" fill="rgba(0,0,0,0.12)" />
      <rect x="176" y="168" width="44" height="58" rx="14" fill="rgba(255,255,255,0.88)" />
      <path d="M188 170 L198 180 L208 170" fill="#5c35b5" opacity="0.6" />
      <path d="M196 172 L198 182 L200 172" fill="#5c35b5" opacity="0.8" />
      <rect x="194" y="158" width="8" height="12" rx="4" fill="#d4a574" />
      <circle cx="198" cy="148" r="18" fill="#d4a574" />
      <path d="M180 143 Q180 128 198 128 Q216 128 216 143" fill="#1a1a2e" />
      <circle cx="192" cy="146" r="2" fill="#1a1a2e" />
      <circle cx="204" cy="146" r="2" fill="#1a1a2e" />
      <path d="M192 154 Q198 158 204 154" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="180" y="205" width="36" height="24" rx="5" fill="rgba(255,255,255,0.5)" />
      <rect x="188" y="201" width="20" height="8" rx="4" fill="rgba(255,255,255,0.35)" />
      <line x1="180" y1="214" x2="216" y2="214" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <rect x="196" y="210" width="8" height="8" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="174" y="240" width="48" height="16" rx="8" fill="rgba(255,255,255,0.2)" />
      <text x="198" y="252" fontSize="8" fontWeight="600" fill="white" textAnchor="middle" fontFamily="Poppins,sans-serif">Employer</text>
      <rect x="30"  y="50" width="52" height="22" rx="11" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <text x="56"  y="65" fontSize="8.5" fontWeight="600" fill="white" textAnchor="middle" fontFamily="Poppins,sans-serif">💻 Coding</text>
      <rect x="114" y="28" width="52" height="22" rx="11" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <text x="140" y="43" fontSize="8.5" fontWeight="600" fill="white" textAnchor="middle" fontFamily="Poppins,sans-serif">🎨 Design</text>
      <rect x="198" y="50" width="52" height="22" rx="11" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <text x="224" y="65" fontSize="8.5" fontWeight="600" fill="white" textAnchor="middle" fontFamily="Poppins,sans-serif">📊 Data</text>
      <circle cx="56"  cy="76" r="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="56"  cy="84" r="1.5" fill="rgba(255,255,255,0.18)" />
      <circle cx="140" cy="54" r="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="140" cy="62" r="1.5" fill="rgba(255,255,255,0.18)" />
      <circle cx="224" cy="76" r="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="224" cy="84" r="1.5" fill="rgba(255,255,255,0.18)" />
      <text x="140" y="278" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="Poppins,sans-serif">Connecting talent with opportunity</text>
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function SkilledLinkLanding() {
  const [scrolled,      setScrolled]      = useState(false);
  const [visible,       setVisible]       = useState({});
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [pricingTab,    setPricingTab]    = useState("student"); // ✅ Naya state toggle ke liye

  const sectionRefs = useRef({});
  const dropdownRef = useRef(null);
  const signupRef   = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        signupRef.current   && !signupRef.current.contains(e.target)
      ) {
        setLoginDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setVisible((prev) => ({ ...prev, [e.target.dataset.id]: true }));
        }),
      { threshold: 0.12 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const reg = (id) => (el) => {
    sectionRefs.current[id] = el;
    if (el) el.dataset.id = id;
  };

  const rv = (id, delay = "") =>
    `reveal${delay} ${visible[id] ? "visible" : ""}`;

  const rankClass = (i) =>
    i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "rank-other";

  const currentPricingPlans = pricingTab === "student" ? studentPlans : companyPlans;

  return (
    <div className="sl-page">

      {/* ── NAVBAR ── */}
      <nav className={`sl-nav${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="sl-nav-logo">
          <img src="/logo.png" alt="SkilledLink Logo" className="sl-nav-logo-img" />
          <span className="sl-nav-logo-text">SkilledLink</span>
        </a>
        <div className="sl-nav-links">
          {NAV_LINKS.map((link) => (
            <a 
              key={link.id} 
              href={`#${link.id}`} 
              className="sl-nav-link"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(link.id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="sl-nav-actions">
          {/* Login dropdown */}
          <div className="sl-login-dropdown-wrap" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              className="sl-btn-nav-login"
              onClick={(e) => {
                e.stopPropagation();
                setLoginDropdown((v) => v !== "login" ? "login" : false);
              }}
            >
              Login {loginDropdown === "login" ? "▲" : "▼"}
            </button>
            {loginDropdown === "login" && (
              <div className="sl-login-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', zIndex: 1000 }}>
                <a href="/login/student" className="sl-login-option">
                  <div className="sl-login-option-icon">🎓</div>
                  <div>
                    <div className="sl-login-option-title">Student</div>
                    <div className="sl-login-option-sub">Login to your student account</div>
                  </div>
                </a>
                <div className="sl-login-option-divider" />
                <a href="/login/company" className="sl-login-option">
                  <div className="sl-login-option-icon">🏢</div>
                  <div>
                    <div className="sl-login-option-title">Company</div>
                    <div className="sl-login-option-sub">Login to your company account</div>
                  </div>
                </a>
              </div>
            )}
          </div>
          {/* Sign Up dropdown */}
          <div className="sl-login-dropdown-wrap" ref={signupRef} style={{ position: 'relative' }}>
            <button
              className="sl-btn-nav-signup"
              onClick={(e) => {
                e.stopPropagation();
                setLoginDropdown((v) => v !== "signup" ? "signup" : false);
              }}
            >
              Sign Up {loginDropdown === "signup" ? "▲" : "▼"}
            </button>
            {loginDropdown === "signup" && (
              <div className="sl-login-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', zIndex: 1000 }}>
                <a href="/register/student" className="sl-login-option">
                  <div className="sl-login-option-icon">🎓</div>
                  <div>
                    <div className="sl-login-option-title">Student</div>
                    <div className="sl-login-option-sub">Create your student account</div>
                  </div>
                </a>
                <div className="sl-login-option-divider" />
                <a href="/register/company" className="sl-login-option">
                  <div className="sl-login-option-icon">🏢</div>
                  <div>
                    <div className="sl-login-option-title">Company</div>
                    <div className="sl-login-option-sub">Create your company account</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section className="sl-hero">
        <div className="sl-hero-left">
          <div className="sl-hero-circle c1" />
          <div className="sl-hero-circle c2" />
          <div className="sl-hero-circle c3" />
          <div className="sl-hero-left-content">
            <div className="sl-hero-svg-wrap">
              <HeroIllustration />
            </div>
            <div className="sl-hero-brand">SkilledLink</div>
            <p className="sl-hero-tagline">
              Assess your skills. Rank among the best.<br />Get hired by top companies.
            </p>
          </div>
        </div>

        <div className="sl-hero-right">
          <div className="sl-hero-right-inner">
            <div className="sl-hero-eyebrow">
              <span className="sl-hero-eyebrow-dot" />
              Now live — 50,000+ students hired
            </div>
            <h1 className="sl-hero-title">
              Where <span>skilled talent</span><br />meets the right opportunity.
            </h1>
            <p className="sl-hero-desc">
              SkilledLink connects students and freshers to top employers through
              AI-powered skill assessments, live leaderboards, and verified credentials
              — making hiring smarter and faster.
            </p>
            <div className="sl-hero-ctas">
              <a href="/register/student" className="sl-cta-primary">Get Started Free</a>
              <a href="/register/company" className="sl-cta-secondary">I'm Hiring →</a>
            </div>
            <div className="sl-hero-stats">
              {[
                { n: "50K+", l: "Students Placed" },
                { n: "500+", l: "Partner Companies" },
                { n: "200+", l: "Skill Tracks" },
                { n: "94%",  l: "Hire Rate" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="sl-hero-stat-num">{s.n}</div>
                  <div className="sl-hero-stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────── */}
      <section className="sl-how" ref={reg("how")}>
        <p className="sl-section-label">How It Works</p>
        <h2 className="sl-section-title">Three steps to your dream job</h2>
        <div className="sl-steps">
          {steps.map((s, i) => (
            <div key={i} className={`sl-step ${rv("how", ` reveal-delay-${i + 1}`)}`}>
              <div className="sl-step-num">{s.n}</div>
              <div className="sl-step-title">{s.title}</div>
              <p className="sl-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section id="features" className="sl-features" ref={reg("features")}>
        <p className="sl-section-label">Features</p>
        <h2 className="sl-section-title">Everything you need to stand out</h2>
        <div className="sl-features-grid">
          {features.map((f, i) => (
            <div key={i} className={`sl-feature-card ${rv("features", ` reveal-delay-${(i % 2) + 1}`)}`}>
              <div className="sl-feature-icon-wrap">{f.icon}</div>
              <div>
                <div className="sl-feature-title">{f.title}</div>
                <p className="sl-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ─────────────────────── */}
      <section id="leaderboard" className="sl-leaderboard" ref={reg("lb")}>
        <p className="sl-section-label">Live Rankings</p>
        <h2 className="sl-section-title">Top Students This Week</h2>
        <div className="sl-leaderboard-inner">
          <div className="sl-rank-list">
            {students.map((s, i) => (
              <div
                key={i}
                className={`sl-rank-row ${rankClass(i)} ${rv("lb")}`}
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <span className="sl-rank-num">{s.rank}</span>
                <Avatar name={s.name} size={38} />
                <div className="sl-rank-info">
                  <div className="sl-rank-name">{s.name}</div>
                  <div className="sl-rank-role">{s.role}</div>
                </div>
                <span className="sl-rank-score">{s.score}%</span>
              </div>
            ))}
          </div>
          <div className="sl-leaderboard-cta">
            <a href="/login/student" className="sl-btn-outline-purple">View Full Leaderboard →</a>
          </div>
        </div>
      </section>

      {/* ── FOR STUDENTS & COMPANIES ─────────────────── */}
      <section id="audience" className="sl-audience" ref={reg("audience")}>
        <p className="sl-section-label">Who Is It For?</p>
        <h2 className="sl-section-title">Built for students and companies</h2>
        <div className="sl-audience-grid">
          <div className={`sl-audience-card ${rv("audience", " reveal-delay-1")}`}>
            <div className="sl-audience-icon">🎓</div>
            <div className="sl-audience-title">For Students</div>
            <p className="sl-audience-desc">
              Prove your skills, climb the leaderboard, and get noticed by the companies you want to work at.
            </p>
            <ul className="sl-audience-list">
              {studentPerks.map((p) => (
                <li key={p}><span className="sl-audience-check">✓</span>{p}</li>
              ))}
            </ul>
            <a href="/register/student" className="sl-audience-btn">Register as Student</a>
          </div>
          <div className={`sl-audience-card ${rv("audience", " reveal-delay-2")}`}>
            <div className="sl-audience-icon">🏢</div>
            <div className="sl-audience-title">For Companies</div>
            <p className="sl-audience-desc">
              Stop sifting through resumes. Find pre-assessed, skill-ranked candidates ready to hire today.
            </p>
            <ul className="sl-audience-list">
              {companyPerks.map((p) => (
                <li key={p}><span className="sl-audience-check">✓</span>{p}</li>
              ))}
            </ul>
            <a href="/register/company" className="sl-audience-btn">Register as Company</a>
          </div>
        </div>
      </section>

      {/* ── QUIZ TEASER SECTION ────────────────────────────── */}
      <section id="quiz" className="sl-quiz-section" ref={reg("quiz")}>
        <div className="sl-quiz-bg-circle qc1" />
        <div className="sl-quiz-bg-circle qc2" />
        <div className="sl-quiz-inner">
          <div className={`${rv("quiz")}`}>
            <span className="sl-quiz-tag">Skill Assessments</span>
            <h2 className="sl-quiz-section-title">
              Test your knowledge.<br />Prove your worth.
            </h2>
            <p className="sl-quiz-section-sub">
              Our timed, adaptive quizzes cover 200+ topics. Each completed assessment earns you a
              verified score and moves you up the leaderboard.
            </p>
          </div>
          <div className={`sl-quiz-card-mock ${rv("quiz", " reveal-delay-1")}`}>
            <div className="sl-quiz-card-header">
              <span className="sl-quiz-card-brand">SkilledLink Quiz</span>
              <span className="sl-quiz-timer">⏱ 19:58</span>
            </div>
            <p className="sl-quiz-q">1. Which device is required for the Internet connection?</p>
            <div className="sl-quiz-opts">
              {["Modem", "Router", "LAN Cable", "Pen Drive"].map((opt, i) => (
                <div key={opt} className={`sl-quiz-opt${i === 0 ? " active" : ""}`}>{opt}</div>
              ))}
            </div>
            <button className="sl-quiz-next">Next</button>
            <p className="sl-quiz-footer-note">1 of 20 Questions</p>
          </div>
          <a href="/login/student" className={`sl-quiz-cta ${rv("quiz", " reveal-delay-2")}`}>
            Login to Start Assessment →
          </a>
        </div>
      </section>

      {/* ── ✅ NEW PRICING SECTION INJECTED HERE (With Toggle) ──────────────────────── */}
      <section id="pricing" style={{ padding: "100px 20px", background: "#fff", textAlign: "center" }} ref={reg("pricing")}>
        <p className={`sl-section-label ${rv("pricing")}`}>Pricing Plans</p>
        <h2 className={`sl-section-title ${rv("pricing", " reveal-delay-1")}`} style={{ marginBottom: "20px" }}>
          Invest in your future.
        </h2>
        <p className={`${rv("pricing", " reveal-delay-1")}`} style={{ color: "#666", maxWidth: "600px", margin: "0 auto 30px auto", lineHeight: "1.6" }}>
          Whether you are a student looking for a job or a company looking for top talent, we have a plan for you.
        </p>

        {/* 🔄 TOGGLE SWITCH */}
        <div className={`${rv("pricing", " reveal-delay-1")}`} style={{ display: "inline-flex", background: "#ede8fb", padding: "5px", borderRadius: "30px", marginBottom: "50px" }}>
          <button 
            onClick={() => setPricingTab("student")}
            style={{
              padding: "10px 25px", borderRadius: "25px", border: "none", fontWeight: "bold", fontSize: "15px", cursor: "pointer", transition: "0.3s",
              background: pricingTab === "student" ? "#553f9a" : "transparent",
              color: pricingTab === "student" ? "#fff" : "#553f9a",
              boxShadow: pricingTab === "student" ? "0 4px 10px rgba(85,63,154,0.3)" : "none"
            }}
          >
            🎓 For Students
          </button>
          <button 
            onClick={() => setPricingTab("company")}
            style={{
              padding: "10px 25px", borderRadius: "25px", border: "none", fontWeight: "bold", fontSize: "15px", cursor: "pointer", transition: "0.3s",
              background: pricingTab === "company" ? "#553f9a" : "transparent",
              color: pricingTab === "company" ? "#fff" : "#553f9a",
              boxShadow: pricingTab === "company" ? "0 4px 10px rgba(85,63,154,0.3)" : "none"
            }}
          >
            🏢 For Companies
          </button>
        </div>

        <div className={`${rv("pricing", " reveal-delay-2")}`} style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap", maxWidth: "1100px", margin: "0 auto" }}>
          {currentPricingPlans.map((plan, i) => (
            <div key={i} style={{ 
              background: plan.isPopular ? "#fdfcff" : "#fff", 
              padding: "40px 30px", 
              borderRadius: "15px", 
              boxShadow: plan.isPopular ? "0 20px 40px rgba(85,63,154,0.15)" : "0 10px 30px rgba(0,0,0,0.05)",
              border: plan.isPopular ? "2px solid #553f9a" : "1px solid #ede8fb",
              width: "300px",
              textAlign: "left",
              position: "relative",
              transform: plan.isPopular ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.3s ease"
            }}>
              {plan.isPopular && (
                <div style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", background: "#553f9a", color: "#fff", padding: "6px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  MOST POPULAR
                </div>
              )}
              <h3 style={{ margin: "0 0 10px 0", color: "#2d1f6e", fontSize: "20px" }}>{plan.name}</h3>
              <div style={{ fontSize: "38px", fontWeight: "900", color: "#111", marginBottom: "15px", display: "flex", alignItems: "baseline" }}>
                {plan.price}
                {plan.duration && <span style={{ fontSize: "16px", fontWeight: "normal", color: "#666", marginLeft: "5px" }}>{plan.duration}</span>}
              </div>
              <p style={{ color: "#666", fontSize: "14px", marginBottom: "30px", minHeight: "45px", lineHeight: "1.5" }}>{plan.desc}</p>
              
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", minHeight: "150px" }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ color: "#444", fontSize: "14.5px", marginBottom: "15px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: "#16a34a", fontWeight: "bold", marginTop: "2px" }}>✓</span> 
                    <span style={{ lineHeight: "1.4" }}>{f}</span>
                  </li>
                ))}
              </ul>
              
              <a 
                href={plan.link}
                className={plan.btnClass} 
                style={{ display: "block", textAlign: "center", width: "100%", padding: "14px", fontWeight: "bold", borderRadius: "8px", boxSizing: "border-box", textDecoration: "none" }}
              >
                {plan.btnText}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUSTED BY SECTION ──────────────────────── */}
      <section className="sl-trusted" ref={reg("cta")}>
        <p className={`sl-section-label ${rv("cta")}`}>Why SkilledLink?</p>
        <h2 className={`sl-section-title ${rv("cta", " reveal-delay-1")}`}>
          Thousands already made it. Your turn.
        </h2>
        <div className={`sl-testimonials ${rv("cta", " reveal-delay-2")}`}>
          <div className="sl-testimonial-card">
            <div className="sl-testimonial-quote">"</div>
            <p className="sl-testimonial-text">
              I got placed at a top MNC within 2 weeks of joining SkilledLink. The assessments really set me apart from other candidates.
            </p>
            <div className="sl-testimonial-author">
              <div className="sl-testimonial-avatar" style={{ background: "#4a27a0" }}>AS</div>
              <div>
                <div className="sl-testimonial-name">Aarav Sharma</div>
                <div className="sl-testimonial-role">Full Stack Dev · Hired at Infosys</div>
              </div>
            </div>
          </div>
          <div className="sl-testimonial-card sl-testimonial-card--featured">
            <div className="sl-testimonial-quote">"</div>
            <p className="sl-testimonial-text">
              As a recruiter, SkilledLink saves us hours. We find pre-vetted, skill-verified candidates in minutes instead of days.
            </p>
            <div className="sl-testimonial-author">
              <div className="sl-testimonial-avatar" style={{ background: "#7b5dc9" }}>PR</div>
              <div>
                <div className="sl-testimonial-name">Priya Rao</div>
                <div className="sl-testimonial-role">HR Manager · TechCorp India</div>
              </div>
            </div>
          </div>
          <div className="sl-testimonial-card">
            <div className="sl-testimonial-quote">"</div>
            <p className="sl-testimonial-text">
              The leaderboard pushed me to keep improving. Climbed to top 5% and got 3 interview calls in a single week!
            </p>
            <div className="sl-testimonial-author">
              <div className="sl-testimonial-avatar" style={{ background: "#8268d4" }}>KM</div>
              <div>
                <div className="sl-testimonial-name">Kunal Mehta</div>
                <div className="sl-testimonial-role">Data Scientist · Hired at Wipro</div>
              </div>
            </div>
          </div>
        </div>
        <div className={`sl-trusted-stats ${rv("cta", " reveal-delay-3")}`}>
          {[
            { n: "50K+",  l: "Students Placed",    icon: "🎓" },
            { n: "500+",  l: "Hiring Companies",   icon: "🏢" },
            { n: "4.9★",  l: "Average Rating",     icon: "⭐" },
            { n: "< 2wk", l: "Avg. Time to Hire",  icon: "⚡" },
          ].map((s) => (
            <div key={s.l} className="sl-trusted-stat">
              <span className="sl-trusted-stat-icon">{s.icon}</span>
              <span className="sl-trusted-stat-num">{s.n}</span>
              <span className="sl-trusted-stat-label">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="sl-footer">
        <div className="sl-footer-cta-band">
          <div className="sl-footer-cta-left">
            <h3 className="sl-footer-cta-title">Ready to find your dream job?</h3>
            <p className="sl-footer-cta-sub">Join 50,000+ students already getting hired through SkilledLink.</p>
          </div>
          <div className="sl-footer-cta-btns">
            <a href="/register/student" className="sl-footer-cta-btn-white">Get Started Free</a>
            <a href="/register/company" className="sl-footer-cta-btn-outline">Hire Talent →</a>
          </div>
        </div>
        <div className="sl-footer-divider" />
        <div className="sl-footer-bottom">
          <div className="sl-footer-bottom-brand">
            <div className="sl-footer-bottom-logo">
              <img src="/logo.png" alt="SkilledLink" className="sl-nav-logo-img" />
              <span className="sl-footer-bottom-name">SkilledLink</span>
            </div>
            <p className="sl-footer-copy">© 2026 SkilledLink. All rights reserved.</p>
          </div>
          <p className="sl-footer-tagline-center">Bridging talent with opportunity — one skill at a time. 🚀</p>
          <div className="sl-footer-socials">
            {[
              { label: "LinkedIn", icon: "in", href: "#" },
              { label: "Twitter",  icon: "𝕏",  href: "#" },
              { label: "GitHub",   icon: "gh", href: "#" },
              { label: "Instagram",icon: "ig", href: "#" },
            ].map((s) => (
              <a key={s.label} href={s.href} className="sl-footer-social-btn" title={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}