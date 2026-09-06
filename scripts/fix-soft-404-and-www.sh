#!/usr/bin/env bash
# Consolidated nginx fix for globaltechtour.ru, addressing two problems
# confirmed live on 2026-09-06 via Yandex Webmaster diagnostics + manual curl:
#
# 1. "Некорректно настроено отображение несуществующих файлов и страниц"
#    (soft 404s). The site's try_files fallback ("... /index.html") served
#    the SPA shell with HTTP 200 for ANY unknown path, real or not — e.g.
#    curl -o /dev/null -w '%{http_code}' https://globaltechtour.ru/this-does-not-exist
#    returned 200. Since the app fully prerenders every real route (see
#    scripts/prerender.mjs — routes derived from the same data as the
#    sitemap: companies, tours, blog posts, static pages), any path that
#    ISN'T a real file/directory in dist/ genuinely doesn't exist, and
#    should 404. Likely a major contributor to why Yandex indexed only 3
#    pages out of 2294 in the sitemap — every bogus URL looking like a
#    valid 200 page tanks the site's overall quality signal.
#    Fix: try_files ... =404, with error_page 404 internally re-serving
#    dist/index.html so users still get the SPA shell, but with a real
#    404 status code (nginx's error_page preserves the original code
#    unless overridden with "=200", so this stays a real 404 for crawlers).
#
# 2. www.globaltechtour.ru (and the .com variants) served identical content
#    with NO redirect to the canonical apex domain (globaltechtour.ru) —
#    Yandex Webmaster then sees them as duplicate content. An earlier
#    script (fix-www-redirect.sh) fixed this once, but a later re-run of
#    deploy-vps.sh appears to have overwritten sites-available/globaltechtour.ru
#    with its own template, which never had the www redirect, silently
#    undoing that fix. This script folds both fixes into one canonical
#    nginx config so a future deploy-vps.sh re-run doesn't regress this
#    again — copy this script's server block back into deploy-vps.sh's
#    heredoc if the two ever need to be reconciled.
#
# Run as root on the VPS, AFTER confirming the cert paths below still match
# `certbot certificates` output (they should, this only reuses the existing
# cert already issued for globaltechtour.ru + www + globaltechtour.com + www).
set -euo pipefail

cat > /etc/nginx/sites-available/globaltechtour.ru <<'EOF'
server {
    listen 443 ssl;
    server_name globaltechtour.ru www.globaltechtour.ru globaltechtour.com www.globaltechtour.com;

    ssl_certificate /etc/letsencrypt/live/globaltechtour.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globaltechtour.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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
}

server {
    listen 80;
    server_name globaltechtour.ru www.globaltechtour.ru globaltechtour.com www.globaltechtour.com;
    return 301 https://globaltechtour.ru$request_uri;
}
EOF

nginx -t
systemctl reload nginx

echo ""
echo "=== ГОТОВО ==="
echo "Проверка 1 (несуществующая страница -> должен быть 404):"
echo "  curl -s -o /dev/null -w '%{http_code}\n' https://globaltechtour.ru/this-page-does-not-exist-xyz"
echo "Проверка 2 (реальная статья -> всё ещё 200):"
echo "  curl -s -o /dev/null -w '%{http_code}\n' https://globaltechtour.ru/blog/anker-innovations-overseas/"
echo "Проверка 3 (www -> редирект на апекс):"
echo "  curl -sI https://www.globaltechtour.ru/ | head -3"
