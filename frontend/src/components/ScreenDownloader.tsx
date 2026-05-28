import { useState } from "react";
import {
  fetchVideoInfo,
  downloadVideo,
  type VideoInfo,
  type VideoFormat,
} from "../api/downloader";
import { AuthError } from "../api/client";
import "./ScreenDownloader.css";

interface ScreenDownloaderProps {
  onAuthRequired: () => void;
}

export default function ScreenDownloader({
  onAuthRequired,
}: ScreenDownloaderProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [formatId, setFormatId] = useState("");
  const [saveToDevice, setSaveToDevice] = useState(true);

  async function handleFetch() {
    if (!url.trim()) return;
    setError("");
    setSuccess("");
    setInfo(null);
    setLoading(true);
    setLoadingText("Fetching video info...");
    try {
      const data = await fetchVideoInfo(url.trim());
      setInfo(data);
      if (data.formats.length > 0) {
        setFormatId(data.formats[0].format_id);
      }
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthRequired();
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!url.trim() || !formatId) return;
    setError("");
    setSuccess("");
    setLoading(true);
    setLoadingText("Downloading...");
    try {
      const res = await downloadVideo(url.trim(), formatId, saveToDevice);
      if (saveToDevice) {
        const blob = await res.blob();
        const cd = res.headers.get("Content-Disposition") || "";
        const match = cd.match(/filename="?(.+?)"?$/);
        const filename = match ? match[1] : "video.mp4";
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
        setSuccess("Download started");
      } else {
        setSuccess("Video saved to server folder");
      }
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthRequired();
      } else {
        setError(err instanceof Error ? err.message : "Download failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      // auto-fetch after short delay
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>("#url-input");
        if (input) {
          setUrl(text);
          handleFetch();
        }
      }, 100);
    } catch (err) {
      setError("Failed to read clipboard");
    }
  }

  function sortedFormats(): VideoFormat[] {
    if (!info) return [];
    return [...info.formats].sort((a, b) => {
      const ha = parseInt(a.resolution) || 0;
      const hb = parseInt(b.resolution) || 0;
      return hb - ha;
    });
  }

  return (
    <div>
      <div className="input-group">
        <input
          id="url-input"
          type="url"
          placeholder="Paste video URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFetch()}
        />
        <button className="clipboard-btn" onClick={handleClipboard}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="img"
            viewBox="0 0 24 24"
          >
            <g fill="currentColor">
              <path d="M10 4a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2h-4zM7.17 4A3.001 3.001 0 0 1 10 2h4c1.306 0 2.418.835 2.83 2H18a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1.17zm0 2H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1.17A3.001 3.001 0 0 1 14 8h-4a3.001 3.001 0 0 1-2.83-2zM7 11a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1z" />
            </g>
          </svg>
        </button>
        <button id="fetch-btn" onClick={handleFetch} disabled={loading}>
          Fetch
        </button>
      </div>

      {error && <div className="msg error">{error}</div>}
      {success && <div className="msg success">{success}</div>}

      {loading && (
        <div className="loading">
          <span className="spinner" />
          <span>{loadingText}</span>
        </div>
      )}

      {info && !loading && (
        <div className="result">
          <div className="video-info">
            <img src={info.thumbnail} alt="Thumbnail" />
            <h2>{info.title}</h2>
          </div>
          <div className="download-group">
            <select
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
            >
              {sortedFormats().map((f) => (
                <option key={f.format_id} value={f.format_id}>
                  {f.resolution} ({f.ext})
                </option>
              ))}
            </select>
            <button
              id="download-btn"
              onClick={handleDownload}
              disabled={loading}
            >
              Download
            </button>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={saveToDevice}
              onChange={(e) => setSaveToDevice(e.target.checked)}
            />
            Save video to device
          </label>
        </div>
      )}
    </div>
  );
}
