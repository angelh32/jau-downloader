import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, request, jsonify, send_file, send_from_directory, g

from app import config
from app.database import init_db, close_db
from app.database.models import Session, Cookie, User
from app.downloader import fetch_info, download_video
from app.auth import register_user, authenticate, destroy_session, login_required, validate_session
from app.cookies import encrypt_cookie

app = Flask(__name__)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")


def _get_optional_user() -> User | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    return validate_session(token)

init_db(config.DATABASE_PATH)
import atexit
atexit.register(close_db)


@app.route("/api/fetch", methods=["POST"])
def api_fetch():
    data = request.get_json(silent=True)
    if not data or "url" not in data:
        return jsonify({"error": "Missing url"}), 400

    try:
        user = _get_optional_user()
        info = fetch_info(data["url"], user=user)
        return jsonify(info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/download")
def api_download():
    url = request.args.get("url")
    format_id = request.args.get("format_id")
    save_to_device = request.args.get("save_to_device", "true").lower() == "true"

    if not url or not format_id:
        return jsonify({"error": "Missing url or format_id"}), 400

    try:
        user = _get_optional_user()
        filepath = download_video(url, format_id, user=user)
        if not save_to_device:
            return jsonify({"success": True, "file": os.path.basename(filepath)})
        return send_file(
            filepath,
            as_attachment=True,
            download_name=os.path.basename(filepath),
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/register", methods=["POST"])
def api_auth_register():
    data = request.get_json(silent=True)
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing username or password"}), 400
    user = register_user(data["username"], data["password"])
    if not user:
        return jsonify({"error": "Username already taken"}), 409
    token = authenticate(data["username"], data["password"])
    return jsonify({"success": True, "token": token, "username": user.username})


@app.route("/api/auth/login", methods=["POST"])
def api_auth_login():
    data = request.get_json(silent=True)
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing username or password"}), 400
    token = authenticate(data["username"], data["password"])
    if not token:
        return jsonify({"error": "Invalid username or password"}), 401
    return jsonify({"success": True, "token": token})


@app.route("/api/auth/logout", methods=["POST"])
def api_auth_logout():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        destroy_session(auth.removeprefix("Bearer ").strip())
    return jsonify({"success": True})


@app.route("/api/auth/sessions", methods=["GET"])
@login_required
def api_auth_sessions():
    sessions = (
        Session.select()
        .where(Session.user == g.current_user, Session.expires_at > datetime.now())
        .order_by(Session.created_at.desc())
    )
    return jsonify({
        "sessions": [
            {
                "id": s.id,
                "created_at": s.created_at.isoformat(),
                "expires_at": s.expires_at.isoformat(),
            }
            for s in sessions
        ]
    })


@app.route("/api/down-sessions", methods=["GET"])
@login_required
def api_cookies_list():
    cookies = (
        Cookie.select()
        .where(Cookie.user == g.current_user)
        .order_by(Cookie.created_at.desc())
    )
    return jsonify({
        "cookies": [
            {
                "id": c.id,
                "page": c.page,
                "created_at": c.created_at.isoformat(),
                "modified_at": c.modified_at.isoformat(),
            }
            for c in cookies
        ]
    })


@app.route("/api/down-sessions", methods=["POST"])
@login_required
def api_cookies_upload():
    data = request.get_json(silent=True)
    if not data or not data.get("page") or not data.get("cookie_raw"):
        return jsonify({"error": "Missing page or cookie_raw"}), 400

    now = datetime.now()
    encrypted = encrypt_cookie(data["cookie_raw"])
    cookie = Cookie.create(
        user=g.current_user,
        page=data["page"],
        cookie_coded=encrypted,
        created_at=now,
        modified_at=now,
    )
    return jsonify({
        "id": cookie.id,
        "page": cookie.page,
        "created_at": cookie.created_at.isoformat(),
        "modified_at": cookie.modified_at.isoformat(),
    }), 201


@app.route("/api/down-sessions/<int:cookie_id>", methods=["DELETE"])
@login_required
def api_cookies_delete(cookie_id):
    try:
        cookie = Cookie.get_by_id(cookie_id)
    except Cookie.DoesNotExist:
        return jsonify({"error": "Cookie not found"}), 404

    if cookie.user != g.current_user:
        return jsonify({"error": "Forbidden"}), 403

    cookie.delete_instance()
    return jsonify({"success": True})


@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)


if __name__ == "__main__":
    from gunicorn.app.wsgiapp import WSGIApplication
    import sys

    sys.argv = [
        "gunicorn",
        "-w", "1",
        "--threads", "1",
        "-b", "0.0.0.0:3000",
        "app.main:app",
    ]
    WSGIApplication().run()
