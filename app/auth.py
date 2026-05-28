import uuid
from datetime import datetime, timedelta
from functools import wraps

from flask import request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash

from app.database.models import User, Session

SESSION_TTL_DAYS = 30


def register_user(username: str, password: str) -> User | None:
    if User.select().where(User.username == username).exists():
        return None
    return User.create(
        username=username,
        password_hash=generate_password_hash(password),
        created_at=datetime.now(),
    )


def authenticate(username: str, password: str) -> str | None:
    try:
        user = User.get(User.username == username)
    except User.DoesNotExist:
        return None
    if not check_password_hash(user.password_hash, password):
        return None
    return _create_session(user)


def _create_session(user: User) -> str:
    token = str(uuid.uuid4())
    Session.create(
        user=user,
        token=token,
        created_at=datetime.now(),
        expires_at=datetime.now() + timedelta(days=SESSION_TTL_DAYS),
    )
    return token


def validate_session(token: str) -> User | None:
    try:
        session = (
            Session.select()
            .where(Session.token == token, Session.expires_at > datetime.now())
            .get()
        )
        return session.user
    except Session.DoesNotExist:
        return None


def destroy_session(token: str) -> None:
    Session.delete().where(Session.token == token).execute()


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401
        token = auth.removeprefix("Bearer ").strip()
        user = validate_session(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        g.current_user = user
        return f(*args, **kwargs)

    return decorated
