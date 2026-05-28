import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import "./AuthOverlay.css";

interface AuthOverlayProps {
  onClose: () => void;
}

export default function AuthOverlay({ onClose }: AuthOverlayProps) {
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
      setError(err instanceof Error ? err.message : "Login failed");
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
      setError("Passwords do not match");
      return;
    }
    try {
      await registerUser(username, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Welcome</h2>
        <p className="subtitle">Sign in or create an account</p>
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            <input name="username" placeholder="Username" required />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input name="username" placeholder="Username" required />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
            />
            <input
              name="confirm"
              type="password"
              placeholder="Confirm password"
              required
            />
            <button type="submit">Register</button>
          </form>
        )}
      </div>
    </div>
  );
}
