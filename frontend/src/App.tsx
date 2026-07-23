import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import AuthOverlay from "./components/AuthOverlay";
import ScreenDownloader from "./components/ScreenDownloader";
import ScreenSettings from "./components/ScreenSettings";
import { getStoredTheme, setStoredTheme } from "./theme";

function AppContent() {
  const { t } = useTranslation();
  const { loading } = useAuth();
  const [screen, setScreen] = useState("downloader");
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    setStoredTheme(getStoredTheme());
  }, []);

  if (loading) return null;

  function handleNavigate(target: string) {
    if (target === "login") {
      setShowAuth(true);
    } else {
      setScreen(target);
    }
  }

  return (
    <div className="layout">
      <NavBar activeScreen={screen} onNavigate={handleNavigate} />

      <main className="main-content">
        <h1>{t("app.title")}</h1>
        <p className="subtitle">{t("app.subtitle")}</p>

        {screen === "downloader" && (
          <ScreenDownloader onAuthRequired={() => setShowAuth(true)} />
        )}
        {screen === "settings" && <ScreenSettings />}
      </main>

      {showAuth && <AuthOverlay onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="container">
        <AppContent />
      </div>
    </AuthProvider>
  );
}
