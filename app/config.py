import os
from dotenv import load_dotenv

load_dotenv()

DOWNLOAD_PATH = os.getenv("DOWNLOAD_PATH", "./downloads")
MAX_FILESIZE_MB = int(os.getenv("MAX_FILESIZE_MB", "2000"))
