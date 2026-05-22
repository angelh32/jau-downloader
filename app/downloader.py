import os
import yt_dlp
from app import config


def fetch_info(url: str) -> dict:
    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)

    formats = []
    for f in info.get("formats", []):
        if f.get("vcodec") == "none":
            continue
        formats.append({
            "format_id": f["format_id"],
            "resolution": f.get("resolution") or f.get("height", "audio") and f"{f['height']}p" or "unknown",
            "ext": f.get("ext", "mp4"),
            "filesize": f.get("filesize") or f.get("filesize_approx") or 0,
        })

    return {
        "title": info.get("title", "Unknown"),
        "thumbnail": info.get("thumbnail", ""),
        "formats": formats,
    }


def download_video(url: str, format_id: str) -> str:
    os.makedirs(config.DOWNLOAD_PATH, exist_ok=True)
    outtmpl = os.path.join(config.DOWNLOAD_PATH, "%(title)s.%(ext)s")

    opts = {
        "format": format_id,
        "outtmpl": outtmpl,
        "quiet": True,
        "no_warnings": True,
        "max_filesize": config.MAX_FILESIZE_MB * 1024 * 1024,
    }

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filepath = ydl.prepare_filename(info)

        if not os.path.exists(filepath):
            base, _ = os.path.splitext(filepath)
            for f in os.listdir(config.DOWNLOAD_PATH):
                if f.startswith(os.path.basename(base)):
                    filepath = os.path.join(config.DOWNLOAD_PATH, f)
                    break

    return filepath
