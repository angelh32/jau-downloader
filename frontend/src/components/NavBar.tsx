import { useAuth } from "../context/AuthContext";
import "./NavBar.css";

interface NavBarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function NavBar({ activeScreen, onNavigate }: NavBarProps) {
  const { isAuthenticated, logoutUser } = useAuth();

  const tabs = [
    { id: "downloader", label: "Download" },
    { id: "settings", label: "Settings" },
    { id: "credentials", label: "Credentials" },
  ];

  return (
    <nav className="nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-btn ${activeScreen === tab.id ? "active" : ""}`}
          onClick={() => onNavigate(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <button
        className="nav-btn auth-btn"
        onClick={isAuthenticated ? logoutUser : () => onNavigate("login")}
      >
        {isAuthenticated ? "Logout" : "Login"}
      </button>
    </nav>
  );
}
