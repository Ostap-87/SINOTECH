#!/usr/bin/env python3
"""Minimal GitHub push-webhook receiver for push-to-deploy.

Listens on 127.0.0.1 only — nginx reverse-proxies /gh-webhook to it, so
it's never reachable directly from the internet. Verifies GitHub's
HMAC-SHA256 signature before doing anything. Stdlib only (no pip installs)
to keep the VPS's footprint small.

On a valid push to BRANCH: fetches, hard-resets to it, npm ci + build.
Since nginx serves dist/ straight from disk, a successful build IS the
deploy — no reload/restart needed afterwards.
"""
import hashlib
import hmac
import json
import os
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRET = os.environ["WEBHOOK_SECRET"].encode()
BRANCH = "claude/sinotech-voyage-setup"
APP_DIR = "/var/www/globaltechtour"
LOG_PATH = "/var/log/gh-webhook-deploy.log"
PORT = 9000

deploy_lock = threading.Lock()


def log(msg):
    with open(LOG_PATH, "a") as f:
        f.write(msg.rstrip() + "\n")


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
