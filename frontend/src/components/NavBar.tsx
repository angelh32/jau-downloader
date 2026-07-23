import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import "./NavBar.css";

interface NavBarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function DownloadIconFilled() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4h2v4h14v-4h2zM7 10l5 5 5-5h-3.5V3h-3v7H7z" />
    </svg>
  );
}

const icons: Record<string, typeof DownloadIcon> = {
  downloader: DownloadIcon,
  settings: SettingsIcon,
};

export default function NavBar({ activeScreen, onNavigate }: NavBarProps) {
  const { t } = useTranslation();
  const { isAuthenticated, username, logoutUser } = useAuth();

  const tabs = [
    { id: "downloader", label: t("nav.download") },
    { id: "settings", label: t("nav.settings") },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <DownloadIconFilled />
        <span>JAU Downloader</span>
      </div>

      <div className="sidebar-nav">
        {tabs.map((tab) => {
          const Icon = icons[tab.id];
          return (
            <button
              key={tab.id}
              className={`nav-item ${activeScreen === tab.id ? "active" : ""}`}
              onClick={() => onNavigate(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-spacer" />
      {isAuthenticated && (
        <button className="nav-item nav-item-logout" onClick={logoutUser}>
          <LogoutIcon />
          <span>{t("nav.logout")}</span>
        </button>
      )}
      <div className="sidebar-footer">
        {isAuthenticated ? (
          <div className="sidebar-user">
            <div className="user-avatar">
              {username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-info">
              <span className="user-name">{username}</span>
            </div>
          </div>
        ) : (
          <button
            className="nav-item login-btn"
            onClick={() => onNavigate("login")}
          >
            <LoginIcon />
            <span>{t("nav.login")}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
