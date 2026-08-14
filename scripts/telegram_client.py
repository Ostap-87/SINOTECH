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


def _call(bot_token, method, payload_dict):
    path = f"/bot{bot_token}/{method}"
    payload = json.dumps(payload_dict).encode()

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


def send_telegram(bot_token, chat_id, text):
    return _call(bot_token, "sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "HTML"})


# Telegram caption limit is 1024 chars, well under our usual 800-1500 char
# posts — so these take an optional caption and let the caller decide
# whether it fits or needs to go as a separate follow-up send_telegram().
def send_telegram_photo(bot_token, chat_id, photo_url, caption=None):
    payload = {"chat_id": chat_id, "photo": photo_url}
    if caption:
        payload["caption"] = caption
        payload["parse_mode"] = "HTML"
    return _call(bot_token, "sendPhoto", payload)


def send_telegram_video(bot_token, chat_id, video_url, caption=None):
    payload = {"chat_id": chat_id, "video": video_url}
    if caption:
        payload["caption"] = caption
        payload["parse_mode"] = "HTML"
    return _call(bot_token, "sendVideo", payload)


TELEGRAM_CAPTION_LIMIT = 1024


def publish_item(bot_token, chat_id, text, media_url=None, media_kind=None):
    """Send one queued post, handling the optional image/video field.

    media_kind is "photo" or "video" (ignored if media_url is falsy — falls
    back to a plain text message). If the text fits Telegram's 1024-char
    caption limit, it rides along as the caption; otherwise the media goes
    out first with no caption, followed by the full text as its own message
    (Telegram keeps consecutive messages from the same bot/channel grouped
    in the client, so this still reads as one post).

    If the media send fails (e.g. a stale/unreachable image URL — this has
    happened when a cover-image generation request never got fulfilled), the
    whole post used to be silently dropped even though the text itself was
    perfectly sendable. Falls back to a text-only send in that case instead,
    so a broken image never costs the post itself.
    """
    if not media_url:
        return send_telegram(bot_token, chat_id, text)

    send_media = send_telegram_video if media_kind == "video" else send_telegram_photo
    caption = text if text and len(text) <= TELEGRAM_CAPTION_LIMIT else None
    ok, detail = send_media(bot_token, chat_id, media_url, caption)
    if not ok:
        # media failed outright — still try to get the text out
        text_ok, text_detail = send_telegram(bot_token, chat_id, text)
        if text_ok:
            return True, f"media failed ({detail}), sent text-only"
        return False, f"media failed ({detail}); text-only fallback also failed ({text_detail})"
    if text and caption is None:
        ok2, detail2 = send_telegram(bot_token, chat_id, text)
        return ok2, detail2
    return ok, detail
