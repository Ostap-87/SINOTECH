#!/usr/bin/env bash
# Consolidated nginx fix for globaltechtour.ru, addressing two problems
# confirmed live on 2026-09-06 via Yandex Webmaster diagnostics + manual curl.
#
# IMPORTANT: the real, active config file is
#   /etc/nginx/sites-available/globaltechtour   (NO ".ru" suffix!)
# — sites-enabled/globaltechtour -> that file, set up via `certbot --nginx`
# (hence the "# managed by Certbot" markers preserved below). An earlier
# version of this script wrote to .../globaltechtour.ru instead, a file
# that isn't symlinked into sites-enabled at all — so it changed nothing on
# the live site despite `nginx -t` passing. Confirmed via:
#   ls -la /etc/nginx/sites-enabled/ | grep -i global
#   cat /etc/nginx/sites-available/globaltechtour
# This version edits the correct file and preserves every location block
# from the live config (media alias, gh-webhook + content-publish proxies)
# that a from-scratch template would have silently dropped.
#
# 1. "Некорректно настроено отображение несуществующих файлов и страниц"
#    (soft 404s). try_files ... /index.html served the SPA shell with HTTP
#    200 for ANY unknown path, real or not (verified: curl a nonsense path,
#    got 200). Since every real route is fully prerendered to a static file
#    (see scripts/prerender.mjs — routes derived from the same data as the
#    sitemap), anything that ISN'T a real file/directory in dist/ genuinely
#    doesn't exist and should 404. Likely a major contributor to Yandex
#    indexing only 3 of 2294 sitemap URLs.
#    Fix: try_files ... =404, with error_page 404 internally re-serving
#    dist/index.html (users still get the SPA shell; error_page preserves
#    the original 404 status for crawlers unless overridden with "=200").
#
# 2. www.globaltechtour.ru (and the .com variants) served identical content
#    with NO redirect to the canonical apex domain — Yandex Webmaster sees
#    them as duplicate content. The live config's HTTP->HTTPS upgrade
#    (Certbot's own "if ($host = ...)" blocks) preserves whatever host the
#    visitor used, so https://www... never became https://(apex). Fix: add
#    a host check inside the HTTPS server block that 301s any non-apex host
#    to the apex domain — one extra hop for www visitors (http://www ->
#    https://www -> https://apex), correct end state either way.
#
# Run as root on the VPS. Reuses the exact cert paths already in the live
# file (no need to check `certbot certificates` — copied verbatim).
set -euo pipefail

CONFIG_FILE="/etc/nginx/sites-available/globaltechtour"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: $CONFIG_FILE not found — checking sites-enabled for the real filename:" >&2
  ls -la /etc/nginx/sites-enabled/ >&2
  exit 1
fi

cp "$CONFIG_FILE" "${CONFIG_FILE}.bak-$(date +%Y%m%d-%H%M%S)"

cat > "$CONFIG_FILE" <<'EOF'
server {
    server_name globaltechtour.ru www.globaltechtour.ru globaltechtour.com www.globaltechtour.com;

    if ($host != globaltechtour.ru) {
        return 301 https://globaltechtour.ru$request_uri;
    }

    root /var/www/globaltechtour/dist;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /index.html;
    location = /index.html {
        internal;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/globaltechtour-media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /gh-webhook {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /content-publish/ {
        proxy_pass http://127.0.0.1:9002/content-publish/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/globaltechtour.ru/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/globaltechtour.ru/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
server {
    if ($host = www.globaltechtour.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = globaltechtour.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name globaltechtour.ru www.globaltechtour.ru globaltechtour.com www.globaltechtour.com;
    return 404; # managed by Certbot
}
EOF

nginx -t
systemctl reload nginx

echo ""
echo "=== ГОТОВО ==="
echo "Бэкап предыдущего конфига сохранён рядом: ${CONFIG_FILE}.bak-*"
echo "Проверка 1 (несуществующая страница -> должен быть 404):"
echo "  curl -s -o /dev/null -w '%{http_code}\n' https://globaltechtour.ru/this-page-does-not-exist-xyz"
echo "Проверка 2 (реальная статья -> всё ещё 200):"
echo "  curl -s -o /dev/null -w '%{http_code}\n' https://globaltechtour.ru/blog/anker-innovations-overseas/"
echo "Проверка 3 (www -> редирект на апекс):"
echo "  curl -sI https://www.globaltechtour.ru/ | head -3"
echo "Проверка 4 (деплой-вебхук всё ещё работает):"
echo "  curl -s -o /dev/null -w '%{http_code}\n' https://globaltechtour.ru/gh-webhook"
