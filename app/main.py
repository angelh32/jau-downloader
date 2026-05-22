import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, request, jsonify, send_file, send_from_directory

from app import config
from app.downloader import fetch_info, download_video

app = Flask(__name__)
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")


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


@app.route("/")
def index():
    return send_from_directory(PUBLIC_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(PUBLIC_DIR, path)


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
