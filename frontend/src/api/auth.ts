import { rawApiFetch, authenticatedApiFetch } from "./client";

export interface AuthResponse {
  success: boolean;
  token: string;
  username?: string;
}

export interface SessionList {
  sessions: {
    id: number;
    created_at: string;
    expires_at: string;
  }[];
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const data = await rawApiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem("jaudownloader_token", data.token);
  return data;
}

export async function register(
  username: string,
  password: string
): Promise<AuthResponse> {
  const data = await rawApiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem("jaudownloader_token", data.token);
  return data;
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem("jaudownloader_token");
  if (token) {
    try {
      await authenticatedApiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  }
  localStorage.removeItem("jaudownloader_token");
}

export async function checkAuth(): Promise<boolean> {
  const token = localStorage.getItem("jaudownloader_token");
  if (!token) return false;
  try {
    await authenticatedApiFetch<SessionList>("/api/auth/sessions");
    return true;
  } catch {
    localStorage.removeItem("jaudownloader_token");
    return false;
  }
}
