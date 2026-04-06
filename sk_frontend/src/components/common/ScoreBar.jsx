// components/common/ScoreBar.jsx

const ScoreBar = ({ label, value }) => (
  <div className="score-bar-wrap">
    <div className="score-bar-label">
      <span>{label}</span>
      <span className="score-val">{value}%</span>
    </div>
    <div className="score-bar-track">
      <div
        className="score-bar-fill"
        style={{
          width: `${value}%`,
          background: value >= 80 ? "#4caf82" : value >= 60 ? "#f0a500" : "#e53e3e"
        }}
      />
    </div>
  </div>
);

export default ScoreBar;
