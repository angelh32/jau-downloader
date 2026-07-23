import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import OverlayWindow from "./OverlayWindow";
import "./AuthOverlay.css";

interface AuthOverlayProps {
  onClose: () => void;
}

export default function AuthOverlay({ onClose }: AuthOverlayProps) {
  const { t } = useTranslation();
  const { loginUser, registerUser } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const password = form.get("password") as string;
    try {
      await loginUser(username, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.login_failed"));
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;
    if (password !== confirm) {
      setError(t("auth.passwords_mismatch"));
      return;
    }
    try {
      await registerUser(username, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.registration_failed"));
    }
  }

  return (
    <OverlayWindow onClose={onClose}>
      <h2>{t("auth.welcome")}</h2>
      <p className="subtitle">{t("auth.subtitle")}</p>
      <div className="auth-tabs">
        <button
          className={`auth-tab ${tab === "login" ? "active" : ""}`}
          onClick={() => setTab("login")}
        >
          {t("auth.login_tab")}
        </button>
        <button
          className={`auth-tab ${tab === "register" ? "active" : ""}`}
          onClick={() => setTab("register")}
        >
          {t("auth.register_tab")}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {tab === "login" ? (
        <form onSubmit={handleLogin}>
          <input name="username" placeholder={t("auth.username_placeholder")} required />
          <input
            name="password"
            type="password"
            placeholder={t("auth.password_placeholder")}
            required
          />
          <button type="submit">{t("auth.login_button")}</button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <input name="username" placeholder={t("auth.username_placeholder")} required />
          <input
            name="password"
            type="password"
            placeholder={t("auth.password_placeholder")}
            required
          />
          <input
            name="confirm"
            type="password"
            placeholder={t("auth.confirm_placeholder")}
            required
          />
          <button type="submit">{t("auth.register_button")}</button>
        </form>
      )}
    </OverlayWindow>
  );
}
