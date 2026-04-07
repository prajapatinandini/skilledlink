
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "hiring", label: "Hiring" },
    { key: "hired", label: "Hired" },
    { key: "placements", label: "Placements" },
    { key: "analytics", label: "Analytics" },
    { key: "talent", label: "Talent Pool" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="SkilledLink" className="logo-img" />
        <span>SkilledLink</span>
      </div>
      <div className="sidebar-divider" />
      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={activeTab === item.key ? "active" : ""}
            onClick={() => setActiveTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="logout-btn" onClick={() => navigate("/login/company")}>
        Log Out
      </button>
    </aside>
  );
};

export default Sidebar;
