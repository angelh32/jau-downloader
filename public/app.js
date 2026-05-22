const API_BASE = "";

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
    const res = await fetch(`${API_BASE}/api/fetch`, {
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
    showError(err.message);
  } finally {
    loading.classList.add("hidden");
    fetchBtn.disabled = false;
  }
}

function downloadVideo() {
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

  if (saveToDevice) {
    window.location.href = `${API_BASE}/api/download?${params}`;
    setTimeout(() => {
      loading.classList.add("hidden");
      downloadBtn.disabled = false;
    }, 3000);
  } else {
    fetch(`${API_BASE}/api/download?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showSuccess("Video saved to server");
        } else {
          showError(data.error || "Download failed");
        }
      })
      .catch((err) => showError(err.message))
      .finally(() => {
        loading.classList.add("hidden");
        downloadBtn.disabled = false;
      });
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
