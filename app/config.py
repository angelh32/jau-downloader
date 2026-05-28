import os
from dotenv import load_dotenv

load_dotenv()

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOWNLOAD_PATH = os.path.join(_BASE_DIR, os.getenv("DOWNLOAD_PATH", "downloads"))
MAX_FILESIZE_MB = int(os.getenv("MAX_FILESIZE_MB", "2000"))
DATABASE_PATH = os.path.join(_BASE_DIR, os.getenv("DATABASE_PATH", "data/app.db"))
