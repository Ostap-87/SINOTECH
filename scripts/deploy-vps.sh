#!/usr/bin/env bash
# One-time (and re-runnable) deploy for this site onto a VPS that already
# runs nginx for other, unrelated sites. Deliberately does NOT touch nginx/
# node/certbot packages or any existing site config — only adds its own
# app directory and its own nginx server block.
#
# Usage (as root on the VPS):
#   curl -fsSL https://raw.githubusercontent.com/Ostap-87/SINOTECH/claude/sinotech-voyage-setup/scripts/deploy-vps.sh -o deploy-vps.sh
#   bash deploy-vps.sh
set -euo pipefail

PRIMARY_DOMAIN="globaltechtour.ru"
REDIRECT_DOMAIN="globaltechtour.com"
APP_DIR="/var/www/globaltechtour"
REPO_URL="https://github.com/Ostap-87/SINOTECH.git"
BRANCH="claude/sinotech-voyage-setup"

echo "==> git (ставим, только если ещё не стоит)"
command -v git >/dev/null 2>&1 || apt-get install -y git

echo "==> клонируем/обновляем репозиторий в отдельную папку"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> сборка (используем уже установленный Node $(node -v))"
npm ci
npm run build
npm cache clean --force

echo "==> новый nginx-конфиг (существующие сайты не трогаем)"
cat >/etc/nginx/sites-available/globaltechtour.ru <<NGINX
server {
    listen 80;
    server_name ${PRIMARY_DOMAIN} www.${PRIMARY_DOMAIN};
    root ${APP_DIR}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name ${REDIRECT_DOMAIN} www.${REDIRECT_DOMAIN};
    return 301 https://${PRIMARY_DOMAIN}\$request_uri;
}
NGINX

ln -sf /etc/nginx/sites-available/globaltechtour.ru /etc/nginx/sites-enabled/globaltechtour.ru

echo "==> проверка конфига (если ошибка — reload НЕ произойдёт, остальные сайты не пострадают)"
nginx -t
systemctl reload nginx

echo
echo "===================================================================="
echo "Готово (HTTP). Как только DNS прогрузится, выпустить HTTPS:"
echo
echo "  certbot --nginx -d ${PRIMARY_DOMAIN} -d www.${PRIMARY_DOMAIN} \\"
echo "    -d ${REDIRECT_DOMAIN} -d www.${REDIRECT_DOMAIN} \\"
echo "    --redirect --agree-tos -m YOUR-EMAIL@EXAMPLE.COM"
echo "===================================================================="
