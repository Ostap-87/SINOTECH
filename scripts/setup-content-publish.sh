#!/usr/bin/env bash
# One-time setup for the content-publish service (topic -> article ->
# Telegram, extendable to other channels). Run once as root on the VPS,
# AFTER setup-webhook.sh (this script does not touch nginx itself — it
# only installs the service that setup-webhook.sh's /content-publish/
# location proxies to; rerun setup-webhook.sh afterwards if that nginx
# location isn't live yet).
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Ostap-87/SINOTECH/claude/sinotech-voyage-setup/scripts/setup-content-publish.sh -o setup-content-publish.sh
#   bash setup-content-publish.sh
set -euo pipefail

APP_DIR="/var/www/globaltechtour"
ENV_FILE="/etc/content-publish.env"
SERVICE_FILE="/etc/systemd/system/content-publish.service"

if [ ! -f "$APP_DIR/scripts/content-publish.py" ]; then
  echo "Ожидается $APP_DIR/scripts/content-publish.py — сначала обновите код (git pull) в $APP_DIR." >&2
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  echo "==> $ENV_FILE уже существует, оставляем как есть (значения не перезаписываем)"
else
  echo "==> Нужны значения для нового env-файла."
  read -rp "Telegram bot token: " TELEGRAM_BOT_TOKEN
  read -rp "Telegram chat id (например -1003942618148): " TELEGRAM_CHAT_ID
  PUBLISH_SECRET="$(openssl rand -hex 32 2>/dev/null || python3 -c 'import secrets; print(secrets.token_hex(32))')"

  cat >"$ENV_FILE" <<EOF
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
PUBLISH_SECRET=${PUBLISH_SECRET}
EOF
  chmod 600 "$ENV_FILE"

  echo
  echo "===================================================================="
  echo "Секрет для публикации (сохраните, он понадобится для запросов):"
  echo "  PUBLISH_SECRET=${PUBLISH_SECRET}"
  echo "===================================================================="
  echo
fi

echo "==> systemd-юнит для content-publish"
cat >"$SERVICE_FILE" <<EOF
[Unit]
Description=Content publishing service (topic -> article -> social channels)
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/python3 ${APP_DIR}/scripts/content-publish.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable content-publish
# restart, not "enable --now" — same reasoning as gh-webhook: a plain
# "start" on an already-running service is a no-op and would keep serving
# old in-memory code after a rerun that updates content-publish.py.
systemctl restart content-publish

echo
echo "===================================================================="
echo "Готово. Проверка (замените YOUR_SECRET на значение из $ENV_FILE):"
echo
echo "  curl -X POST https://globaltechtour.ru/content-publish/publish \\"
echo "    -H 'X-Publish-Secret: YOUR_SECRET' -H 'Content-Type: application/json' \\"
echo "    -d '{\"project\":\"globaltechtour\",\"text\":\"Тест публикации\"}'"
echo
echo "Если /content-publish/ ещё не проксируется nginx — перезапустите"
echo "setup-webhook.sh, он уже содержит нужный location-блок."
echo "===================================================================="
