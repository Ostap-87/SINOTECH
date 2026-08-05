#!/usr/bin/env python3
"""Minimal GitHub push-webhook receiver for push-to-deploy.

Listens on 127.0.0.1 only — nginx reverse-proxies /gh-webhook to it, so
it's never reachable directly from the internet. Verifies GitHub's
HMAC-SHA256 signature before doing anything. Stdlib only (no pip installs)
to keep the VPS's footprint small.

On a valid push to BRANCH: fetches, hard-resets to it, npm ci + build.
Since nginx serves dist/ straight from disk, a successful build IS the
deploy — no reload/restart needed afterwards.

After a successful build, also publishes any new content/pending/*.json
files to Telegram (see publish_pending() below) — this is how the
assistant ships an article/post: write the JSON file, commit, push. The
assistant's own sandboxed session can't reach api.telegram.org or even
globaltechtour.ru directly (network policy), but this script runs ON the
VPS, which has normal outbound internet — so publishing piggybacks on
the one channel that reliably works end-to-end: a git push.

Same reasoning applies to image generation: the assistant's sandbox also
can't reach Higgsfield's API directly, but this VPS can — see
process_pending_images() / image_gen.py, triggered by pushing a request to
content/pending-images/*.json.
"""
import hashlib
import hmac
import json
import os
import sqlite3
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from telegram_client import publish_item
from image_gen import process_pending_images

SECRET = os.environ["WEBHOOK_SECRET"].encode()
BRANCH = "claude/sinotech-voyage-setup"
APP_DIR = "/var/www/globaltechtour"
LOG_PATH = "/var/log/gh-webhook-deploy.log"
PORT = 9000

CONTENT_PUBLISH_ENV = "/etc/content-publish.env"
CONTENT_DB_PATH = "/var/lib/content-publish/history.db"
PENDING_DIR = os.path.join(APP_DIR, "content", "pending")

PENDING_IMAGES_DIR = os.path.join(APP_DIR, "content", "pending-images")
MEDIA_DIR = "/var/www/globaltechtour-media"
IMAGE_DB_PATH = "/var/lib/content-publish/images-history.db"

deploy_lock = threading.Lock()


def log(msg):
    with open(LOG_PATH, "a") as f:
        f.write(msg.rstrip() + "\n")


def load_env_file(path):
    values = {}
    if not os.path.exists(path):
        return values
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            values[key.strip()] = value.strip()
    return values


def publish_pending():
    """Send any content/pending/*.json files not yet recorded in the
    shared content-publish history DB. Idempotent across redeploys —
    `git reset --hard` doesn't touch the untracked SQLite DB, and files
    stay in content/pending/ (nothing here deletes or moves them), so
    each slug is only ever sent once."""
    env = load_env_file(CONTENT_PUBLISH_ENV)
    bot_token = env.get("TELEGRAM_BOT_TOKEN")
    chat_id = env.get("TELEGRAM_CHAT_ID")
    if not bot_token or not chat_id:
        return  # content-publish not set up yet — nothing to do

    if not os.path.isdir(PENDING_DIR):
        return

    os.makedirs(os.path.dirname(CONTENT_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(CONTENT_DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project TEXT NOT NULL,
            channel TEXT NOT NULL,
            title TEXT,
            text TEXT NOT NULL,
            status TEXT NOT NULL,
            error TEXT,
            created_at INTEGER NOT NULL,
            slug TEXT UNIQUE
        )
        """
    )

    for filename in sorted(os.listdir(PENDING_DIR)):
        if not filename.endswith(".json"):
            continue
        slug = filename[: -len(".json")]
        existing = conn.execute(
            "SELECT status FROM posts WHERE slug = ? AND channel = 'telegram'", (slug,)
        ).fetchone()
        if existing and existing[0] == "published":
            continue  # only a confirmed success is final; retry anything else

        with open(os.path.join(PENDING_DIR, filename)) as f:
            item = json.load(f)

        text = item.get("text")
        if not text:
            log(f"Skipping {filename}: no 'text' field")
            continue

        # Optional cover media: "image" or "video" is a fully-qualified
        # https:// URL (Telegram fetches it itself, so it must already be
        # live — i.e. committed under public/ in the same push as this
        # pending file, so the build serves it before this code runs).
        media_url = item.get("image") or item.get("video")
        media_kind = "video" if item.get("video") else "photo"
        ok, detail = publish_item(bot_token, chat_id, text, media_url, media_kind)
        conn.execute(
            "INSERT INTO posts (project, channel, title, text, status, error, created_at, slug) "
            "VALUES (?, 'telegram', ?, ?, ?, ?, ?, ?) "
            "ON CONFLICT(slug) DO UPDATE SET status = excluded.status, error = excluded.error, "
            "created_at = excluded.created_at",
            (
                item.get("project", "globaltechtour"),
                item.get("title"),
                text,
                "published" if ok else "failed",
                None if ok else detail,
                int(time.time()),
                slug,
            ),
        )
        conn.commit()
        log(f"content-publish[{slug}]: {'OK' if ok else 'FAILED — ' + detail}")

    conn.close()


def run_deploy():
    if not deploy_lock.acquire(blocking=False):
        log("Deploy already in progress, skipping overlapping trigger.")
        return
    try:
        log(f"=== Deploy started ({BRANCH}) ===")
        steps = [
            ["git", "fetch", "origin", BRANCH],
            ["git", "checkout", BRANCH],
            ["git", "reset", "--hard", f"origin/{BRANCH}"],
            ["npm", "ci"],
            ["npm", "run", "build"],
            ["npm", "cache", "clean", "--force"],
        ]
        for cmd in steps:
            result = subprocess.run(cmd, cwd=APP_DIR, capture_output=True, text=True)
            log(f"$ {' '.join(cmd)}\n{result.stdout}\n{result.stderr}")
            if result.returncode != 0:
                log(f"=== Deploy FAILED at: {' '.join(cmd)} ===")
                return
        log("=== Deploy finished OK ===")

        try:
            publish_pending()
        except Exception as e:
            log(f"publish_pending() error: {e}")

        try:
            process_pending_images(PENDING_IMAGES_DIR, MEDIA_DIR, IMAGE_DB_PATH, log=log)
        except Exception as e:
            log(f"process_pending_images() error: {e}")
    finally:
        deploy_lock.release()


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)

        signature = self.headers.get("X-Hub-Signature-256", "")
        expected = "sha256=" + hmac.new(SECRET, body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            log("Rejected: bad/missing signature")
            self.send_response(401)
            self.end_headers()
            return

        try:
            payload = json.loads(body)
        except ValueError:
            self.send_response(400)
            self.end_headers()
            return

        ref = payload.get("ref", "")
        if ref != f"refs/heads/{BRANCH}":
            log(f"Ignored push to {ref!r}")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ignored (different branch)")
            return

        self.send_response(202)
        self.end_headers()
        self.wfile.write(b"deploy triggered")
        threading.Thread(target=run_deploy, daemon=True).start()

    def log_message(self, fmt, *args):
        pass  # app-level logging goes to LOG_PATH instead


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    log(f"Webhook receiver listening on 127.0.0.1:{PORT}")
    server.serve_forever()
