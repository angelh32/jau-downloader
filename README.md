# LocalVidDown

Self-hosted video downloader for local networks. Paste a URL from YouTube, Facebook, Twitter, Instagram, TikTok, or 1000+ other sites and download it at your chosen resolution.

## Setup

```bash
# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend && npm install && cd ..
```

## Run — development (hot reload)

```bash
# Terminal 1 — API server
source venv/bin/activate && python app/main.py

# Terminal 2 — Vite dev server
cd frontend && npm run dev
```

Open `http://localhost:5173` (Vite proxies `/api` to Flask on `:3000`).

## Run — production

```bash
cd frontend && npm run build
source venv/bin/activate && python app/main.py
```

Open `http://localhost:3000`.

## Docker

```bash
docker compose up -d --build
```
