"""Shared Higgsfield image-generation helper.

Reads pending generation requests (written by the assistant into
content/pending-images/*.json, same convention as content-publish's
content/pending/*.json), calls the `higgsfield` CLI — already authenticated
on this VPS via ~/.config/higgsfield/credentials.json — and downloads the
result into a persistent, git-independent media directory that nginx serves
directly (see setup-webhook.sh's /media/ location). That directory is
deliberately OUTSIDE the app's git checkout: `npm run build` empties dist/
on every deploy, and `git reset --hard` would wipe an untracked file placed
inside the repo, so anything generated here would vanish on the next push.

Idempotent across redeploys, same pattern as webhook-deploy.py's
publish_pending(): each request's slug (filename minus .json) is recorded in
a local SQLite DB; only a confirmed 'published' status is treated as done, so
a crashed or failed generation retries on the next deploy.

The exact shape of `higgsfield generate create --json ... --wait` output
wasn't available while writing this (no live call made to avoid spending a
credit before the pipeline existed) — _find_media_url() therefore searches
defensively for a plausible media URL rather than assuming one exact key
path. If a real run turns up a shape this misses, that's a one-line fix to
the key list below, not a redesign.
"""
import json
import os
import sqlite3
import subprocess
import time
import urllib.request

MEDIA_URL_KEYS = ("url", "media_url", "output_url", "result_url", "asset_url", "download_url")
MEDIA_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov", ".webm")


def _find_media_url(obj):
    if isinstance(obj, str):
        base = obj.split("?")[0].lower()
        if obj.startswith("http") and base.endswith(MEDIA_EXTENSIONS):
            return obj
        return None
    if isinstance(obj, dict):
        for key in MEDIA_URL_KEYS:
            value = obj.get(key)
            if isinstance(value, str) and value.startswith("http"):
                return value
        for value in obj.values():
            found = _find_media_url(value)
            if found:
                return found
        return None
    if isinstance(obj, list):
        for value in obj:
            found = _find_media_url(value)
            if found:
                return found
    return None


def generate_and_download(prompt, model, dest_path, extra_args=None, timeout=420):
    """Runs the CLI, finds the resulting media URL, downloads it to
    dest_path. Returns (ok: bool, detail: str) — detail is the source media
    URL on success, an error message on failure."""
    cmd = [
        "higgsfield", "--json", "generate", "create", model,
        "--prompt", prompt, "--wait", "--wait-timeout", "5m",
    ]
    if extra_args:
        cmd += extra_args

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return False, "higgsfield CLI timed out"

    if result.returncode != 0:
        return False, f"higgsfield CLI failed: {(result.stderr or result.stdout).strip()[:500]}"

    try:
        parsed = json.loads(result.stdout)
    except ValueError:
        return False, f"could not parse CLI JSON output: {result.stdout[:500]}"

    media_url = _find_media_url(parsed)
    if not media_url:
        return False, f"no media URL found in CLI output: {json.dumps(parsed)[:500]}"

    try:
        req = urllib.request.Request(media_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
    except Exception as e:
        return False, f"failed to download generated media: {e}"

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, "wb") as f:
        f.write(data)
    return True, media_url


def process_pending_images(pending_dir, media_dir, db_path, log=print):
    """Request file shape: {"prompt": "...", "model": "gpt_image_2",
    "filename": "cover.png", "extra_args": ["--aspect-ratio", "16:9"]}.
    filename defaults to "<slug>.png"; model defaults to "gpt_image_2"."""
    if not os.path.isdir(pending_dir):
        return

    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE,
            prompt TEXT NOT NULL,
            status TEXT NOT NULL,
            error TEXT,
            created_at INTEGER NOT NULL
        )
        """
    )

    for filename in sorted(os.listdir(pending_dir)):
        if not filename.endswith(".json"):
            continue
        slug = filename[: -len(".json")]
        existing = conn.execute("SELECT status FROM images WHERE slug = ?", (slug,)).fetchone()
        if existing and existing[0] == "published":
            continue  # only a confirmed success is final; retry anything else

        with open(os.path.join(pending_dir, filename)) as f:
            item = json.load(f)

        prompt = item.get("prompt")
        if not prompt:
            log(f"image-gen: skipping {filename}, no 'prompt' field")
            continue
        out_filename = item.get("filename") or f"{slug}.png"
        model = item.get("model", "gpt_image_2")
        extra_args = item.get("extra_args")

        dest_path = os.path.join(media_dir, out_filename)
        ok, detail = generate_and_download(prompt, model, dest_path, extra_args)
        conn.execute(
            "INSERT INTO images (slug, prompt, status, error, created_at) VALUES (?, ?, ?, ?, ?) "
            "ON CONFLICT(slug) DO UPDATE SET status = excluded.status, error = excluded.error, "
            "created_at = excluded.created_at",
            (slug, prompt, "published" if ok else "failed", None if ok else detail, int(time.time())),
        )
        conn.commit()
        log(f"image-gen[{slug}]: {'OK -> ' + out_filename if ok else 'FAILED — ' + detail}")

    conn.close()
