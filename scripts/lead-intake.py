#!/usr/bin/env python3
"""Lead-capture backend for the Contacts page form.

The site itself is a static SPA with no server of its own (see
webhook-deploy.py) — this tiny stdlib-only HTTP service fills that one
gap. nginx reverse-proxies POST /api/lead here (127.0.0.1 only, never
reachable directly from the internet — same pattern as
webhook-deploy.py's /gh-webhook). Every submission is written to
LOG_PATH *before* attempting delivery, so a lead is never silently lost
even if Telegram is briefly unreachable — matches the "заявка не
теряется" rule already used for Aura Robotics' /api/lead.

Delivery channel: Telegram only for now (via the pinned-IP client in
telegram_client.py — this VPS has a known DNS/routing quirk reaching
api.telegram.org, already documented there and worked around in
/etc/hosts). Reads TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID from
/etc/globaltechtour-lead.env, matching how /etc/aura-lead.env was set up
for Aura — same bot/chat as command-poller.py's, reused rather than
provisioning a new one.
"""
import json
import os
import re
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from telegram_client import send_telegram

PORT = 8090
LOG_PATH = "/var/log/globaltechtour-lead.log"
ENV_PATH = "/etc/globaltechtour-lead.env"

EMAIL_RE = re.compile(r"^\S+@\S+\.\S+$")

# In-memory rate limit: RATE_LIMIT submissions per RATE_WINDOW seconds per IP.
# Resets on service restart — acceptable for this traffic volume, avoids a
# database for something this small.
_hits: dict[str, list[float]] = {}
RATE_LIMIT = 5
RATE_WINDOW = 60

FIELD_LABELS = [
    ("name", "Имя"),
    ("companyName", "Компания"),
    ("phone", "Телефон"),
    ("email", "Email"),
    ("telegram", "Telegram"),
    ("message", "Сообщение"),
]


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


ENV = load_env_file(ENV_PATH)
BOT_TOKEN = ENV.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TELEGRAM_BOT_TOKEN")
CHAT_ID = ENV.get("TELEGRAM_CHAT_ID") or os.environ.get("TELEGRAM_CHAT_ID")


def log(msg):
    line = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, "a") as f:
        f.write(line + "\n")


def format_lead(data):
    lines = ["Заявка с сайта Global Tech Tour", ""]
    for key, label in FIELD_LABELS:
        value = str(data.get(key, "")).strip()
        if value:
            lines.append(f"{label}: {value}")
    return "\n".join(lines)


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/lead":
            self._send_json(404, {"ok": False, "error": "not found"})
            return

        ip = self.headers.get("X-Real-IP") or self.client_address[0]
        now = time.time()
        hits = [t for t in _hits.get(ip, []) if now - t < RATE_WINDOW]
        if len(hits) >= RATE_LIMIT:
            self._send_json(429, {"ok": False, "error": "rate limited"})
            return
        hits.append(now)
        _hits[ip] = hits

        length = int(self.headers.get("Content-Length", 0))
        if length == 0 or length > 20_000:
            self._send_json(400, {"ok": False, "error": "bad request"})
            return
        try:
            data = json.loads(self.rfile.read(length))
        except Exception:
            self._send_json(400, {"ok": False, "error": "invalid json"})
            return

        # Honeypot: a hidden field real visitors never see or fill; bots
        # that fill every input trip it. Reply as if it succeeded so the
        # bot doesn't learn its submission was rejected.
        if str(data.get("website", "")).strip():
            self._send_json(200, {"ok": True})
            return

        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip()
        if not name or not EMAIL_RE.match(email):
            self._send_json(400, {"ok": False, "error": "name and a valid email are required"})
            return

        log(f"[lead] {json.dumps(data, ensure_ascii=False)}")

        if BOT_TOKEN and CHAT_ID:
            try:
                ok, info = send_telegram(BOT_TOKEN, CHAT_ID, format_lead(data))
                if not ok:
                    log(f"[lead:telegram-error] {info}")
            except Exception as e:  # noqa: BLE001 — never let a delivery failure break the response
                log(f"[lead:telegram-error] {e}")
        else:
            log("[lead:telegram-error] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured")

        self._send_json(200, {"ok": True})

    def log_message(self, format, *args):  # noqa: A002 — BaseHTTPRequestHandler's signature
        pass  # we log ourselves above; suppress the default stderr access log


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    log(f"lead-intake listening on 127.0.0.1:{PORT}")
    server.serve_forever()
