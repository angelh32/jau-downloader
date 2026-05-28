const API_BASE = "";

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    showAuthOverlay();
    throw new Error("Authentication required");
  }
  return res;
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
  document.getElementById(`screen-${name}`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.nav-btn[data-screen="${name}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

function updateAuthUI() {
  const btn = document.getElementById("auth-toggle-btn");
  const token = getToken();
  btn.textContent = token ? "Logout" : "Login";
}

function showAuthOverlay() {
  document.getElementById("auth-overlay").classList.remove("hidden");
}

function hideAuthOverlay() {
  document.getElementById("auth-overlay").classList.add("hidden");
}

function switchAuthTab(tab) {
  document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
  document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add("active");
  document.getElementById("auth-login-form").classList.toggle("hidden", tab !== "login");
  document.getElementById("auth-register-form").classList.toggle("hidden", tab !== "register");
  document.getElementById("auth-error").classList.add("hidden");
}

async function fetchVideo() {
  const url = document.getElementById("url-input").value.trim();
  if (!url) return;

  const error = document.getElementById("error");
  const result = document.getElementById("result");
  const loading = document.getElementById("loading");
  const loadingText = document.getElementById("loading-text");
  const fetchBtn = document.getElementById("fetch-btn");

  error.classList.add("hidden");
  result.classList.add("hidden");
  loading.classList.remove("hidden");
  loadingText.textContent = "Fetching video info...";
  fetchBtn.disabled = true;

  try {
    const res = await apiFetch("/api/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Failed to fetch video info");
      return;
    }

    document.getElementById("title").textContent = data.title;
    document.getElementById("thumbnail").src = data.thumbnail;

    const select = document.getElementById("format-select");
    select.innerHTML = "";

    const sorted = data.formats.sort((a, b) => {
      const ha = parseInt(a.resolution) || 0;
      const hb = parseInt(b.resolution) || 0;
      return hb - ha;
    });

    for (const f of sorted) {
      const opt = document.createElement("option");
      opt.value = f.format_id;
      opt.textContent = `${f.resolution} (${f.ext})`;
      select.appendChild(opt);
    }

    result.classList.remove("hidden");
  } catch (err) {
    if (err.message !== "Authentication required") {
      showError(err.message);
    }
  } finally {
    loading.classList.add("hidden");
    fetchBtn.disabled = false;
  }
}

async function downloadVideo() {
  const url = document.getElementById("url-input").value.trim();
  const formatId = document.getElementById("format-select").value;
  const saveToDevice = document.getElementById("save-device").checked;
  const loading = document.getElementById("loading");
  const loadingText = document.getElementById("loading-text");
  const downloadBtn = document.getElementById("download-btn");

  loading.classList.remove("hidden");
  loadingText.textContent = "Downloading...";
  downloadBtn.disabled = true;

  const params = new URLSearchParams({ url, format_id: formatId, save_to_device: saveToDevice });

  try {
    const res = await apiFetch(`/api/download?${params}`);

    if (saveToDevice) {
      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Download failed");
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="?(.+?)"?$/);
      const filename = match ? match[1] : "video.mp4";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
      showSuccess("Download started");
    } else {
      const data = await res.json();
      if (data.success) {
        showSuccess("Video saved to server folder");
      } else {
        showError(data.error || "Download failed");
      }
    }
  } catch (err) {
    if (err.message !== "Authentication required") {
      showError(err.message);
    }
  } finally {
    loading.classList.add("hidden");
    downloadBtn.disabled = false;
  }
}

function showSuccess(msg) {
  const el = document.getElementById("error");
  el.textContent = msg;
  el.classList.remove("hidden", "error");
  el.classList.add("success");
}

function showError(msg) {
  const el = document.getElementById("error");
  el.textContent = msg;
  el.classList.remove("hidden", "success");
  el.classList.add("error");
}

async function getClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("url-input").value = text;
    fetchVideo();
  } catch (err) {
    showError("Failed to read clipboard: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  updateAuthUI();

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => showScreen(btn.dataset.screen));
  });

  document.getElementById("auth-toggle-btn").addEventListener("click", async () => {
    if (getToken()) {
      await logout();
      updateAuthUI();
      showScreen("downloader");
    } else {
      showAuthOverlay();
    }
  });

  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchAuthTab(tab.dataset.tab));
  });

  document.getElementById("auth-login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;
    const errEl = document.getElementById("auth-error");
    errEl.classList.add("hidden");
    try {
      await login(username, password);
      updateAuthUI();
      hideAuthOverlay();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove("hidden");
    }
  });

  document.getElementById("auth-register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;
    const errEl = document.getElementById("auth-error");
    errEl.classList.add("hidden");
    if (password !== confirm) {
      errEl.textContent = "Passwords do not match";
      errEl.classList.remove("hidden");
      return;
    }
    try {
      await register(username, password);
      updateAuthUI();
      hideAuthOverlay();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove("hidden");
    }
  });
});
