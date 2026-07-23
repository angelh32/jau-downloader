import { authenticatedApiFetch } from "./client";

export interface VideoInfo {
  title: string;
  thumbnail: string;
  formats: VideoFormat[];
}

export interface VideoFormat {
  format_id: string;
  resolution: string;
  ext: string;
  format: string;
}

export async function fetchVideoInfo(
  url: string
): Promise<VideoInfo> {
  return authenticatedApiFetch<VideoInfo>("/api/fetch", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function downloadVideo(
  url: string,
  formatId: string,
  saveToDevice: boolean
): Promise<Response> {
  const params = new URLSearchParams({
    url,
    format_id: formatId,
    save_to_device: String(saveToDevice),
  });
  const token = localStorage.getItem("jaudownloader_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`/api/download?${params}`, { headers });
  if (res.status === 401) {
    localStorage.removeItem("jaudownloader_token");
    throw new Error("Authentication required");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Download failed");
  }
  return res;
}

// ── Down-sessions (stored auth sessions for sites) ──

export interface DownSession {
  id: number;
  page: string;
  created_at: string;
  modified_at: string;
}

export interface DownSessionList {
  cookies: DownSession[];
}

export async function fetchDownSessions(): Promise<DownSessionList> {
  return authenticatedApiFetch<DownSessionList>("/api/down-sessions");
}

export async function uploadDownSession(
  page: string,
  cookieRaw: string
): Promise<DownSession> {
  return authenticatedApiFetch<DownSession>("/api/down-sessions", {
    method: "POST",
    body: JSON.stringify({ page, cookie_raw: cookieRaw }),
  });
}

export async function deleteDownSession(id: number): Promise<void> {
  await authenticatedApiFetch(`/api/down-sessions/${id}`, {
    method: "DELETE",
  });
}
