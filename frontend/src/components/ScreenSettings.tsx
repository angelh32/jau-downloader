import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useAuth } from "../context/AuthContext";
import { getStoredTheme, setStoredTheme } from "../theme";
import {
  fetchDownSessions,
  uploadDownSession,
  deleteDownSession,
  type DownSession,
} from "../api/downloader";
import "./ScreenSettings.css";

export default function ScreenSettings() {
  const { t } = useTranslation();
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
      setError(err instanceof Error ? err.message : t("credentials.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, t]);

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
      setSuccess(t("credentials.saved_success"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("credentials.upload_failed"));
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
      setSuccess(t("credentials.deleted_success"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("credentials.delete_failed"));
    }
  }

  function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  }

  const [theme, setTheme] = useState(getStoredTheme());

  return (
    <div className="card">
      <div className="setting-row">
        <label>{t("language.label")}</label>
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div className="setting-row">
        <label>{t("theme.label")}</label>
        <select
          value={theme}
          onChange={(e) => {
            const val = e.target.value as "dark" | "light";
            setStoredTheme(val);
            setTheme(val);
          }}
        >
          <option value="dark">{t("theme.dark")}</option>
          <option value="light">{t("theme.light")}</option>
        </select>
      </div>

      <hr className="section-divider" />

      {isAuthenticated && (
        <>
          <h2>{t("credentials.title")}</h2>
          <p className="subtitle">{t("credentials.subtitle")}</p>

          {error && <div className="msg error">{error}</div>}
          {success && <div className="msg success">{success}</div>}

          {loading ? (
            <div className="loading">
              <span className="spinner" />
              <span>{t("credentials.loading")}</span>
            </div>
          ) : sessions.length === 0 ? (
            <p className="empty">{t("credentials.empty")}</p>
          ) : (
            <ul className="session-list">
              {sessions.map((s) => (
                <li key={s.id} className="session-row">
                  <span className="session-page">{s.page}</span>
                  <span className="session-date">{fmtDate(s.modified_at)}</span>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(s.id)}
                    title={t("credentials.delete_title")}
                  >
                    {t("credentials.delete_button")}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button className="btn-add" onClick={() => setShowForm(true)}>
            {t("credentials.add_button")}
          </button>

          {showForm && (
            <div className="session-overlay" onClick={() => setShowForm(false)}>
              <div className="session-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{t("credentials.modal_title")}</h3>
                <p className="subtitle">{t("credentials.modal_subtitle")}</p>
                <select
                  className="input"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                >
                  <option value="">{t("credentials.select_site")}</option>
                  <option value="facebook">{t("credentials.site_facebook")}</option>
                  <option value="youtube">{t("credentials.site_youtube")}</option>
                  <option value="twitter">{t("credentials.site_twitter")}</option>
                  <option value="instagram">{t("credentials.site_instagram")}</option>
                  <option value="tiktok">{t("credentials.site_tiktok")}</option>
                </select>
                <textarea
                  className="input textarea"
                  placeholder={t("credentials.textarea_placeholder")}
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
                  {uploading ? t("credentials.saving") : t("credentials.save_session")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
