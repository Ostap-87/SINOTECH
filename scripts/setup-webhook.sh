#!/usr/bin/env bash
# One-time setup for push-to-deploy: GitHub push -> nginx -> local webhook
# receiver -> git pull + npm build. Run once as root on the VPS, after
# deploy-vps.sh has already cloned the app into APP_DIR at least once.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Ostap-87/SINOTECH/claude/sinotech-voyage-setup/scripts/setup-webhook.sh -o setup-webhook.sh
#   bash setup-webhook.sh
set -euo pipefail

APP_DIR="/var/www/globaltechtour"
DOMAIN="globaltechtour.ru"
ENV_FILE="/etc/globaltechtour-webhook.env"
SERVICE_FILE="/etc/systemd/system/gh-webhook.service"
NGINX_CONF="/etc/nginx/sites-available/globaltechtour.ru"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Ожидается, что $APP_DIR уже склонирован — сначала запустите deploy-vps.sh." >&2
  exit 1
fi

echo "==> обновляем код (чтобы webhook-deploy.py точно был на месте)"
cd "$APP_DIR"
git fetch origin claude/sinotech-voyage-setup
git checkout claude/sinotech-voyage-setup
git reset --hard origin/claude/sinotech-voyage-setup

if [ -f "$ENV_FILE" ] && grep -q '^WEBHOOK_SECRET=' "$ENV_FILE"; then
  echo "==> секрет уже существует, переиспользуем (перезапуск скрипта не ломает GitHub-вебхук)"
  SECRET="$(grep '^WEBHOOK_SECRET=' "$ENV_FILE" | cut -d= -f2-)"
else
  echo "==> генерируем секрет для вебхука"
  SECRET="$(openssl rand -hex 32 2>/dev/null || python3 -c 'import secrets; print(secrets.token_hex(32))')"
  cat >"$ENV_FILE" <<EOF
WEBHOOK_SECRET=${SECRET}
EOF
  chmod 600 "$ENV_FILE"
fi

echo "==> systemd-юнит для приёмника вебхуков"
cat >"$SERVICE_FILE" <<EOF
[Unit]
Description=GitHub push-to-deploy webhook receiver for globaltechtour
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/python3 ${APP_DIR}/scripts/webhook-deploy.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now gh-webhook

echo "==> nginx: пересобираем конфиг ${DOMAIN} набело (старый сохраняем рядом с .bak)"
cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%s)" 2>/dev/null || true

cat >"$NGINX_CONF" <<'NGINX'
server {
    listen 80;
    server_name globaltechtour.ru www.globaltechtour.ru;
    return 301 https://globaltechtour.ru$request_uri;
}

server {
    listen 80;
    server_name globaltechtour.com www.globaltechtour.com;
    return 301 https://globaltechtour.ru$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name globaltechtour.com www.globaltechtour.com;

    ssl_certificate /etc/letsencrypt/live/globaltechtour.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globaltechtour.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://globaltechtour.ru$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name globaltechtour.ru www.globaltechtour.ru;

    ssl_certificate /etc/letsencrypt/live/globaltechtour.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globaltechtour.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/globaltechtour/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # index.html references content-hashed JS/CSS filenames that change on
    # every deploy — if a browser caches this file, it can end up pointing
    # at assets a later deploy already deleted, which reads as a blank
    # white page until the user force-refreshes. Always revalidate it.
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /gh-webhook {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

echo "==> проверка и перезагрузка nginx (если ошибка — старые сайты не пострадают)"
nginx -t
systemctl reload nginx

echo
echo "===================================================================="
echo "Готово. Добавьте вебхук в GitHub:"
echo "  Repo -> Settings -> Webhooks -> Add webhook"
echo "  Payload URL:  https://${DOMAIN}/gh-webhook"
echo "  Content type: application/json"
echo "  Secret:       ${SECRET}"
echo "  Events:       Just the push event"
echo
echo "Лог автодеплоя потом смотреть так:"
echo "  tail -f /var/log/gh-webhook-deploy.log"
echo "===================================================================="
