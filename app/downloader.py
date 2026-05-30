import os
import tempfile

import yt_dlp
from app import config
from app.cookies import decrypt_cookie
from app.database.models import Cookie, User


def check_extractor(url: str) -> str:
    for ie in yt_dlp.extractor.gen_extractors():
        if ie.suitable(url) and ie.IE_NAME != "generic":
            return ie.IE_NAME.lower()
    return ""


def get_download_credentials(page_key: str, user: User | None = None) -> str | None:
    if user is None:
        return None
    cookie_row = (
        Cookie.select()
        .where(Cookie.page == page_key, Cookie.user == user)
        .order_by(Cookie.modified_at.desc())
        .first()
    )
    if cookie_row is None:
        return None
    return decrypt_cookie(cookie_row.cookie_coded)

def _write_cookie_tempfile(cookie: str) -> str:
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
    f.write(cookie)
    f.close()
    return f.name


def fetch_info(url: str, user: User | None = None) -> dict:
    page_key = check_extractor(url)
    cookie = get_download_credentials(page_key, user=user) if page_key else None

    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "restrictfilenames": True,
    }

    cookie_path = None
    try:
        if cookie:
            cookie_path = _write_cookie_tempfile(cookie)
            opts["cookiefile"] = cookie_path

        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
    finally:
        if cookie_path and os.path.exists(cookie_path):
            os.unlink(cookie_path)

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


def download_video(url: str, format_id: str, user: User | None = None) -> str:
    page_key = check_extractor(url)
    cookie = get_download_credentials(page_key, user=user) if page_key else None

    os.makedirs(config.DOWNLOAD_PATH, exist_ok=True)
    outtmpl = os.path.join(config.DOWNLOAD_PATH, "%(title)s.%(ext)s")

    opts = {
        "format": format_id,
        "outtmpl": outtmpl,
        "quiet": True,
        "no_warnings": True,
        "restrictfilenames": True,
        "max_filesize": config.MAX_FILESIZE_MB * 1024 * 1024,
    }

    cookie_path = None
    try:
        if cookie:
            cookie_path = _write_cookie_tempfile(cookie)
            opts["cookiefile"] = cookie_path

        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filepath = ydl.prepare_filename(info)

            if not os.path.exists(filepath):
                base, _ = os.path.splitext(filepath)
                for f in os.listdir(config.DOWNLOAD_PATH):
                    if f.startswith(os.path.basename(base)):
                        filepath = os.path.join(config.DOWNLOAD_PATH, f)
                        break
    finally:
        if cookie_path and os.path.exists(cookie_path):
            os.unlink(cookie_path)

    return filepath
