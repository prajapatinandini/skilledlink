// components/common/DurationBadge.jsx

const DurationBadge = ({ daysLeft }) => {
  const urgent = daysLeft <= 5;
  const warning = daysLeft <= 10;
  const bg = urgent ? "#fff5f5" : warning ? "#fff8e6" : "#f0fdf4";
  const border = urgent ? "#fca5a5" : warning ? "#fcd34d" : "#86efac";
  const color = urgent ? "#b91c1c" : warning ? "#92400e" : "#15803d";
  const icon = urgent ? "🔴" : warning ? "🟡" : "🟢";
  const label = daysLeft === 0
    ? "Closing today!"
    : daysLeft === 1
      ? "1 day left"
      : `${daysLeft} days left`;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      background: bg,
      border: `1.5px solid ${border}`,
      color,
      fontSize: "13px",
      fontWeight: 700,
      padding: "5px 12px",
      borderRadius: "20px",
      whiteSpace: "nowrap",
    }}>
      {icon} {label} to apply
    </span>
  );
};

export default DurationBadge;
