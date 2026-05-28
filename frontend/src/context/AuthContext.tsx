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
  loginUser: (username: string, password: string) => Promise<AuthResponse>;
  registerUser: (username: string, password: string) => Promise<AuthResponse>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth()
      .then(setIsAuthenticated)
      .finally(() => setLoading(false));
  }, []);

  const loginUser = useCallback(async (username: string, password: string) => {
    const data = await login(username, password);
    setIsAuthenticated(true);
    return data;
  }, []);

  const registerUser = useCallback(
    async (username: string, password: string) => {
      const data = await register(username, password);
      setIsAuthenticated(true);
      return data;
    },
    []
  );

  const logoutUser = useCallback(async () => {
    await logout();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, loginUser, registerUser, logoutUser }}
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
