# LocalVidDown — AI Context

## Overview
Self-hosted video downloader. Paste URL → fetch formats → download. SQLite + Peewee ORM, Bearer token auth.

## Tech Stack
- **Backend:** Python 3.12 + Flask + gunicorn
- **Downloader:** yt-dlp (Python library, not CLI)
- **Frontend:** React 19 + TypeScript + Vite
- **Database:** SQLite + Peewee ORM
- **Config:** .env via python-dotenv

## Project Structure
```
app/
  main.py        # Flask routes: API endpoints, auth, static serving
  downloader.py  # yt-dlp wrapper: fetch_info(), download_video()
  config.py      # Env vars: DOWNLOAD_PATH, MAX_FILESIZE_MB, DATABASE_PATH
  auth.py        # register, login, logout, session validation, login_required decorator
  cookies.py     # encrypt/decrypt cookie jars for yt-dlp
  database/
    __init__.py  # Peewee SqliteDatabase singleton, init/close helpers
    models.py    # User, Session models
frontend/
  src/
    api/         # API client layer (client.ts, auth.ts, downloader.ts)
    components/  # React components (NavBar, AuthOverlay, screen components)
    context/     # AuthContext (token state, login/logout/register)
    App.tsx      # Root component with screen routing
    main.tsx     # Entry point
  index.html     # Vite entry HTML
  vite.config.ts # Dev proxy /api -> localhost:3000
Dockerfile       # Multi-stage: pnpm build frontend (Node), python:3.12-alpine + ffmpeg
docker-compose.yml  # Port 3000, volume ./downloads, .env
.dockerignore    # Excludes .env, venv, downloads, frontend src/node_modules from build
```

## Key Conventions
- yt-dlp used as native lib, not subprocess. Always `quiet=True`, `no_warnings=True`.
- `fetch_info()` skips download, returns `{title, thumbnail, formats[]}`. Filters out audio-only formats (`vcodec == "none"`).
- `download_video()` saves to `DOWNLOAD_PATH`, returns filepath. Handles extension mismatch via filename fallback search.
- Gunicorn run via `__main__` block (direct `python app/main.py`). Workers/threads tuned in there.
- Static files served from `frontend/dist/` (or `public/` fallback) via `send_from_directory`.
- Auth via Bearer token: `Authorization: Bearer <token>` header. Token stored in localStorage (`fdown_token`).
- Database auto-created on app start at `DATABASE_PATH` (default `data/app.db`).
- `.env` not committed. `downloads/` not committed. `data/` not committed.

## Config (app/config.py)
| Var | Default | Description |
|---|---|---|
| `DOWNLOAD_PATH` | `./downloads` | Where downloaded files land |
| `MAX_FILESIZE_MB` | `2000` | Reject files above this |
| `DATABASE_PATH` | `data/app.db` | SQLite database file path |
| `COOKIE_ENCRYPTION_KEY` | — | Fernet key for encrypting cookie jars |

## Docker

```bash
# Standard build & run
docker compose up -d --build

# Multi-arch (build amd64 from ARM Mac)
docker buildx build --platform linux/amd64 -t localviddown:latest --load .
docker save localviddown:latest | gzip > localviddown.tar.gz

# On target x86 machine:
gunzip -c localviddown.tar.gz | docker load
docker compose up -d
```

> `.env` **must** set `DOWNLOAD_PATH=/downloads` when using Docker (absolute path inside container).

## Run

```bash
# Dev: two terminals
source venv/bin/activate && python app/main.py                            # Flask API on :3000
cd frontend && npm run dev                                                 # Vite dev server on :5173 (proxies /api -> :3000)

# Production: build frontend then serve
cd frontend && npm run build
cd .. && source venv/bin/activate && python app/main.py                   # Serves frontend/dist + API

# OR
gunicorn -w 1 --threads 1 -b 0.0.0.0:3000 app.main:app
```
