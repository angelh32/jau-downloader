import os
from cryptography.fernet import Fernet
from app import config

_KEY_FILE = os.path.join(os.path.dirname(config.DATABASE_PATH), "encryption.key")


def _get_key() -> bytes:
    if config.COOKIE_ENCRYPTION_KEY:
        return config.COOKIE_ENCRYPTION_KEY.encode()
    if os.path.exists(_KEY_FILE):
        with open(_KEY_FILE, "rb") as f:
            return f.read().strip()
    key = Fernet.generate_key()
    os.makedirs(os.path.dirname(_KEY_FILE), exist_ok=True)
    with open(_KEY_FILE, "wb") as f:
        f.write(key)
    return key


_fernet = Fernet(_get_key())


def encrypt_cookie(raw: str) -> str:
    return _fernet.encrypt(raw.encode()).decode()


def decrypt_cookie(encoded: str) -> str:
    return _fernet.decrypt(encoded.encode()).decode()
