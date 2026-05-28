import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchDownSessions,
  uploadDownSession,
  deleteDownSession,
  type DownSession,
} from "../api/downloader";
import "./ScreenCredentials.css";

export default function ScreenCredentials() {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<DownSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState("");
  const [cookieRaw, setCookieRaw] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await fetchDownSessions();
      setSessions(data.cookies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload() {
    if (!page.trim() || !cookieRaw.trim()) return;
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      await uploadDownSession(page.trim(), cookieRaw.trim());
      setPage("");
      setCookieRaw("");
      setShowForm(false);
      setSuccess("Session saved");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    setError("");
    setSuccess("");
    try {
      await deleteDownSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSuccess("Session deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  }

  if (!isAuthenticated) return null;

  return (
    <div>
      <h2>Stored Sessions</h2>
      <p className="subtitle">
        Saved login sessions for sites that require authentication
      </p>

      {error && <div className="msg error">{error}</div>}
      {success && <div className="msg success">{success}</div>}

      {loading ? (
        <div className="loading">
          <span className="spinner" />
          <span>Loading sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <p className="empty">No sessions saved yet</p>
      ) : (
        <ul className="session-list">
          {sessions.map((s) => (
            <li key={s.id} className="session-row">
              <span className="session-page">{s.page}</span>
              <span className="session-date">{fmtDate(s.modified_at)}</span>
              <button
                className="btn-delete"
                onClick={() => handleDelete(s.id)}
                title="Delete session"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className="btn-add" onClick={() => setShowForm(true)}>
        + Add Session
      </button>

      {showForm && (
        <div className="session-overlay" onClick={() => setShowForm(false)}>
          <div className="session-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Session</h3>
            <p className="subtitle">Paste session data for a site</p>
            <input
              className="input"
              placeholder="Site name (e.g. facebook.com)"
              value={page}
              onChange={(e) => setPage(e.target.value)}
            />
            <textarea
              className="input textarea"
              placeholder="Paste session data here..."
              value={cookieRaw}
              onChange={(e) => setCookieRaw(e.target.value)}
              rows={3}
            />
            {error && <div className="msg error form-error">{error}</div>}
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={uploading || !page.trim() || !cookieRaw.trim()}
            >
              {uploading ? "Saving..." : "Save Session"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
