# JAU Downloader

Self-hosted web app for downloading videos from YouTube, Facebook, Twitter, Instagram, TikTok, and 1000+ other sites. Paste a URL, pick your quality, download — no ads, no limits.

## Features

- **Multi-site** — yt-dlp powered, supports virtually every video platform
- **Auth system** — optional user accounts, session management via Bearer tokens
- **Cookie-based sessions** — save login cookies for sites that require authentication
- **Responsive UI** — clean sidebar layout with light/dark themes, i18n (EN/ES)
- **Docker-ready** — single `docker compose up` deploys everything

## Quick start

```bash
docker compose up -d --build
```

Open `http://localhost:3000`.

## Dev

```bash
source venv/bin/activate && pip install -r requirements.txt  # backend
cd frontend && pnpm install                                    # frontend
```

Terminal 1: `source venv/bin/activate && python app/main.py`
Terminal 2: `cd frontend && npm run dev`

Open `http://localhost:5173`.
