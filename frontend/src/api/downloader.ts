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
  filesize: number;
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
  const token = localStorage.getItem("fdown_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`/api/download?${params}`, { headers });
  if (res.status === 401) {
    localStorage.removeItem("fdown_token");
    throw new Error("Authentication required");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Download failed");
  }
  return res;
}
