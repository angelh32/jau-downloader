import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import "./NavBar.css";

interface NavBarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function NavBar({ activeScreen, onNavigate }: NavBarProps) {
  const { t } = useTranslation();
  const { isAuthenticated, logoutUser } = useAuth();

  const tabs = [
    { id: "downloader", label: t("nav.download") },
    { id: "settings", label: t("nav.settings") },
    { id: "credentials", label: t("nav.credentials") },
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
        {isAuthenticated ? t("nav.logout") : t("nav.login")}
      </button>
    </nav>
  );
}
