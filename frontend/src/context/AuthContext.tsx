import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { checkAuth, login, register, logout, type AuthResponse } from "../api/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  username: string | null;
  loginUser: (username: string, password: string) => Promise<AuthResponse>;
  registerUser: (username: string, password: string) => Promise<AuthResponse>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("jaudownloader_user")
  );

  useEffect(() => {
    checkAuth()
      .then((ok) => {
        if (!ok) {
          localStorage.removeItem("jaudownloader_user");
          setUsername(null);
        }
        setIsAuthenticated(ok);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginUser = useCallback(async (username: string, password: string) => {
    const data = await login(username, password);
    setIsAuthenticated(true);
    setUsername(data.username ?? username);
    localStorage.setItem("jaudownloader_user", data.username ?? username);
    return data;
  }, []);

  const registerUser = useCallback(
    async (username: string, password: string) => {
      const data = await register(username, password);
      setIsAuthenticated(true);
      setUsername(data.username ?? username);
      localStorage.setItem("jaudownloader_user", data.username ?? username);
      return data;
    },
    []
  );

  const logoutUser = useCallback(async () => {
    await logout();
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem("jaudownloader_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, username, loginUser, registerUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
