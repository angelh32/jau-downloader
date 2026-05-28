import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import AuthOverlay from "./components/AuthOverlay";
import ScreenDownloader from "./components/ScreenDownloader";
import ScreenSettings from "./components/ScreenSettings";
import ScreenCredentials from "./components/ScreenCredentials";

function AppContent() {
  const { loading } = useAuth();
  const [screen, setScreen] = useState("downloader");
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return null;

  function handleNavigate(target: string) {
    if (target === "login") {
      setShowAuth(true);
    } else {
      setScreen(target);
    }
  }

  return (
    <>
      <h1>Local video Downloader</h1>
      <p className="subtitle">
        Download public videos from YouTube, Facebook, Twitter, and more
      </p>

      <NavBar activeScreen={screen} onNavigate={handleNavigate} />

      {screen === "downloader" && (
        <ScreenDownloader onAuthRequired={() => setShowAuth(true)} />
      )}
      {screen === "settings" && <ScreenSettings />}
      {screen === "credentials" && <ScreenCredentials />}

      {showAuth && <AuthOverlay onClose={() => setShowAuth(false)} />}
    </>
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
