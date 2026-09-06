#!/usr/bin/env python3
"""Minimal GitHub push-webhook receiver for push-to-deploy.

Listens on 127.0.0.1 only — nginx reverse-proxies /gh-webhook to it, so
it's never reachable directly from the internet. Verifies GitHub's
HMAC-SHA256 signature before doing anything. Stdlib only (no pip installs)
to keep the VPS's footprint small.

On a valid push to BRANCH: fetches, hard-resets to it, npm ci + build.
Since nginx serves dist/ straight from disk, a successful build IS the
deploy — no reload/restart needed afterwards.

Telegram posts are NOT published from here (see claude-control's
data/editorial-policy.md, "Доставка в канал в момент слота") — that used
to go through content/pending/*.json + this deploy, but it was replaced
because a post physically couldn't go out until the (sometimes slow or
failing) full site rebuild finished. The current path is
data/tg-queue/<project>/ -> data/tg-publish/<project>/ in the
claude-control repo, delivered straight to Telegram by
command-poller.py (a separate systemd service on this same VPS) —
entirely independent of this deploy. Do not reintroduce a
content/pending-based Telegram publish step here.

Image generation is a separate, still-live mechanism: the assistant's
sandbox can't reach Higgsfield's API directly, but this VPS can — see
process_pending_images() / image_gen.py, triggered by pushing a request to
content/pending-images/*.json.
"""
import hashlib
import hmac
import json
import os
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from image_gen import process_pending_images

SECRET = os.environ["WEBHOOK_SECRET"].encode()
BRANCH = "claude/sinotech-voyage-setup"
APP_DIR = "/var/www/globaltechtour"
LOG_PATH = "/var/log/gh-webhook-deploy.log"
PORT = 9000

PENDING_IMAGES_DIR = os.path.join(APP_DIR, "content", "pending-images")
MEDIA_DIR = "/var/www/globaltechtour-media"
IMAGE_DB_PATH = "/var/lib/content-publish/images-history.db"

deploy_lock = threading.Lock()
# Set when a valid push arrives while a deploy is already running. The old
# behavior ("skipping overlapping trigger") just dropped that push on the
# floor — the site would stay on a stale commit until some later, unrelated
# push happened to land outside a build window. Now the thread currently
# holding deploy_lock checks this flag right after it finishes and, if set,
# clears it and runs again immediately. Since each run starts with
# `git reset --hard origin/BRANCH`, a rerun always picks up whatever is
# newest at that point — so several pushes arriving mid-build collapse into
# exactly one extra rerun, not one rerun per missed push.
pending_redeploy = False
pending_lock = threading.Lock()


def log(msg):
    with open(LOG_PATH, "a") as f:
        f.write(msg.rstrip() + "\n")


def run_deploy():
    """Acquire the deploy lock and run one-or-more deploy passes back to
    back: if a newer push arrives (see `pending_redeploy`) while this pass
    is still building, loop and run again immediately after, instead of
    letting that push's changes sit un-deployed until some future push
    happens to trigger a fresh run."""
    global pending_redeploy
    if not deploy_lock.acquire(blocking=False):
        with pending_lock:
            pending_redeploy = True
        log("Deploy already in progress — queued a rerun for right after it finishes.")
        return
    try:
        while True:
            _run_deploy_once()
            with pending_lock:
                if pending_redeploy:
                    pending_redeploy = False
                    rerun = True
                else:
                    rerun = False
            if not rerun:
                break
            log("Rerunning deploy — a newer push arrived while the previous deploy was still running.")
    finally:
        deploy_lock.release()


def _run_deploy_once():
    log(f"=== Deploy started ({BRANCH}) ===")

    # Phase 1: sync code, fast enough to never be the bottleneck.
    sync_steps = [
        ["git", "fetch", "origin", BRANCH],
        ["git", "checkout", BRANCH],
        ["git", "reset", "--hard", f"origin/{BRANCH}"],
    ]
    for cmd in sync_steps:
        result = subprocess.run(cmd, cwd=APP_DIR, capture_output=True, text=True)
        log(f"$ {' '.join(cmd)}\n{result.stdout}\n{result.stderr}")
        if result.returncode != 0:
            log(f"=== Deploy FAILED at: {' '.join(cmd)} ===")
            return

    # Phase 2: a quick `rsync` of public/ into dist/ (a few hundred ms,
    # not a real build) makes any newly-generated media immediately
    # fetchable before the (slower, occasionally failing) full rebuild
    # below reproduces the same files as a normal side effect — so this
    # is purely a "make it live sooner" step, not a shortcut that skips
    # anything the real build does.
    os.makedirs(os.path.join(APP_DIR, "dist"), exist_ok=True)
    result = subprocess.run(
        ["rsync", "-a", "public/", "dist/"], cwd=APP_DIR, capture_output=True, text=True
    )
    log(f"$ rsync -a public/ dist/\n{result.stdout}\n{result.stderr}")
    if result.returncode != 0:
        log("rsync of public/ -> dist/ failed (non-fatal, continuing) — "
            "brand-new media may 404 until the full build finishes")

    try:
        process_pending_images(PENDING_IMAGES_DIR, MEDIA_DIR, IMAGE_DB_PATH, log=log)
    except Exception as e:
        log(f"process_pending_images() error: {e}")

    log("=== Content synced, starting full site rebuild ===")

    # Phase 3: the slow part. A failure here no longer takes Telegram
    # down with it — worst case the site keeps serving the previous
    # build until the next successful deploy.
    build_steps = [
        ["npm", "ci"],
        ["npm", "run", "build"],
        ["npm", "cache", "clean", "--force"],
    ]
    for cmd in build_steps:
        result = subprocess.run(cmd, cwd=APP_DIR, capture_output=True, text=True)
        log(f"$ {' '.join(cmd)}\n{result.stdout}\n{result.stderr}")
        if result.returncode != 0:
            log(f"=== Deploy FAILED at: {' '.join(cmd)} ===")
            return
    log("=== Deploy finished OK ===")


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
