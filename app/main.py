import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, request, jsonify, send_file, send_from_directory, g

from app import config
from app.database import init_db, close_db
from app.database.models import Session
from app.downloader import fetch_info, download_video
from app.auth import register_user, authenticate, destroy_session, login_required

app = Flask(__name__)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

init_db(config.DATABASE_PATH)
import atexit
atexit.register(close_db)


@app.route("/api/fetch", methods=["POST"])
def api_fetch():
    data = request.get_json(silent=True)
    if not data or "url" not in data:
        return jsonify({"error": "Missing url"}), 400

    try:
        info = fetch_info(data["url"])
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
        filepath = download_video(url, format_id)
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
