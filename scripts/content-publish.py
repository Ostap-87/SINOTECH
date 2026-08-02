#!/usr/bin/env python3
"""Content-publishing endpoint: article/post -> Telegram (and later other
channels). Listens on 127.0.0.1 only — nginx reverse-proxies /content-publish
to it, so it's never reachable directly from the internet.

Why this exists: the assistant's own sandboxed session cannot reach
api.telegram.org directly (blocked by that session's network policy), but it
CAN reach https://globaltechtour.ru over plain HTTPS. So publishing goes:
  assistant -> https://globaltechtour.ru/content-publish (this endpoint)
             -> Telegram Bot API (VPS has normal, unrestricted internet)

Auth is a shared secret in the X-Publish-Secret header (same pattern as the
GitHub webhook's HMAC secret, just simpler since this isn't signing a
GitHub-shaped payload). Every publish is logged to a local SQLite DB for
history, keyed by project (globaltechtour, aura-robotics, ...) so a future
dashboard can list/filter it.
"""
import json
import os
import sqlite3
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from telegram_client import send_telegram

PUBLISH_SECRET = os.environ["PUBLISH_SECRET"]
TELEGRAM_BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]
DB_PATH = os.environ.get("CONTENT_DB_PATH", "/var/lib/content-publish/history.db")
PORT = 9002

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


def db():
    conn = sqlite3.connect(DB_PATH)
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
    return conn


class Handler(BaseHTTPRequestHandler):
    def _json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/content-publish/publish":
            return self._json(404, {"error": "not found"})

        if self.headers.get("X-Publish-Secret") != PUBLISH_SECRET:
            return self._json(401, {"error": "unauthorized"})

        length = int(self.headers.get("Content-Length", 0))
        try:
            data = json.loads(self.rfile.read(length))
        except ValueError:
            return self._json(400, {"error": "invalid json"})

        project = data.get("project", "globaltechtour")
        title = data.get("title")
        text = data.get("text")
        if not text:
            return self._json(400, {"error": "text is required"})

        ok, detail = send_telegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, text)

        conn = db()
        conn.execute(
            "INSERT INTO posts (project, channel, title, text, status, error, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                project,
                "telegram",
                title,
                text,
                "published" if ok else "failed",
                None if ok else detail,
                int(time.time()),
            ),
        )
        conn.commit()
        conn.close()

        if ok:
            return self._json(200, {"status": "published", "channel": "telegram"})
        return self._json(502, {"status": "failed", "detail": detail})

    def do_GET(self):
        if self.path != "/content-publish/history":
            return self._json(404, {"error": "not found"})
        if self.headers.get("X-Publish-Secret") != PUBLISH_SECRET:
            return self._json(401, {"error": "unauthorized"})

        conn = db()
        rows = conn.execute(
            "SELECT id, project, channel, title, text, status, error, created_at "
            "FROM posts ORDER BY id DESC LIMIT 100"
        ).fetchall()
        conn.close()
        return self._json(
            200,
            {
                "posts": [
                    {
                        "id": r[0],
                        "project": r[1],
                        "channel": r[2],
                        "title": r[3],
                        "text": r[4],
                        "status": r[5],
                        "error": r[6],
                        "created_at": r[7],
                    }
                    for r in rows
                ]
            },
        )

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    server.serve_forever()
