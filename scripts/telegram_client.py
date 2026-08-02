"""Shared Telegram-sending helper for content-publish.py and
webhook-deploy.py.

The VPS's DNS (both reg.ru's resolvers and, initially, even a public
resolver until its cache was flushed) intermittently fails to resolve or
route to some of Telegram's IPs while others work fine — a leftover of
partial ISP/hosting-level filtering. Connecting straight to a verified
IP sidesteps that: the TLS handshake still verifies against the real
hostname (SNI + cert check), and the Host header is still the real
domain, only the TCP destination is pinned — the same trick as
`curl --resolve`. Falls back to normal DNS resolution in case this
specific IP stops working later.
"""
import http.client
import json
import socket
import ssl

TELEGRAM_HOST = "api.telegram.org"
KNOWN_GOOD_IPS = ["149.154.167.220"]


def _post(connect_target, path, payload_bytes, timeout=10):
    context = ssl.create_default_context()
    if connect_target == TELEGRAM_HOST:
        conn = http.client.HTTPSConnection(TELEGRAM_HOST, timeout=timeout, context=context)
    else:
        raw_sock = socket.create_connection((connect_target, 443), timeout=timeout)
        sock = context.wrap_socket(raw_sock, server_hostname=TELEGRAM_HOST)
        conn = http.client.HTTPSConnection(TELEGRAM_HOST, timeout=timeout)
        conn.sock = sock
    try:
        conn.request(
            "POST",
            path,
            body=payload_bytes,
            headers={"Content-Type": "application/json", "Host": TELEGRAM_HOST},
        )
        resp = conn.getresponse()
        return resp.status, resp.read()
    finally:
        conn.close()


def send_telegram(bot_token, chat_id, text):
    path = f"/bot{bot_token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "HTML"}).encode()

    last_error = None
    for target in KNOWN_GOOD_IPS + [TELEGRAM_HOST]:
        try:
            status, body = _post(target, path, payload)
            parsed = json.loads(body)
            if 200 <= status < 300:
                return parsed.get("ok", False), json.dumps(parsed)
            last_error = json.dumps(parsed)
        except Exception as e:
            last_error = f"{target}: {e}"
    return False, last_error or "unknown error"
