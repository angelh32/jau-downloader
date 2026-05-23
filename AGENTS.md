# LocalVidDown — AI Context

## Overview
Self-hosted video downloader. Paste URL → fetch formats → download. Stateless, no DB, no auth.

## Tech Stack
- **Backend:** Python 3.12 + Flask + gunicorn
- **Downloader:** yt-dlp (Python library, not CLI)
- **Frontend:** Vanilla HTML/CSS/JS
- **Config:** .env via python-dotenv

## Project Structure
```
app/
  main.py        # Flask routes: /api/fetch POST, /api/download GET, static serving
  downloader.py  # yt-dlp wrapper: fetch_info(), download_video()
  config.py      # Env vars: DOWNLOAD_PATH, MAX_FILESIZE_MB
public/
  index.html     # Single-page UI
  style.css      # Dark theme
  app.js         # Fetch + download logic
Dockerfile       # python:3.12-slim + ffmpeg, gunicorn CMD
docker-compose.yml  # Port 3000, volume ./downloads, .env
.dockerignore    # Excludes .env, venv, downloads from build
```

## Key Conventions
- yt-dlp used as native lib, not subprocess. Always `quiet=True`, `no_warnings=True`.
- `fetch_info()` skips download, returns `{title, thumbnail, formats[]}`. Filters out audio-only formats (`vcodec == "none"`).
- `download_video()` saves to `DOWNLOAD_PATH`, returns filepath. Handles extension mismatch via filename fallback search.
- Gunicorn run via `__main__` block (direct `python app/main.py`). Workers/threads tuned in there.
- Static files served from `public/` via `send_from_directory`.
- `.env` not committed. `downloads/` not committed.

## Config (app/config.py)
| Var | Default | Description |
|---|---|---|
| `DOWNLOAD_PATH` | `./downloads` | Where downloaded files land |
| `MAX_FILESIZE_MB` | `2000` | Reject files above this |

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
source venv/bin/activate
python app/main.py
# OR
gunicorn -w 1 --threads 1 -b 0.0.0.0:3000 app.main:app
```

## V2 Candidates
- Concurrency tuning (more workers/threads)
- Migrate to FastAPI + `run_in_executor` for async
