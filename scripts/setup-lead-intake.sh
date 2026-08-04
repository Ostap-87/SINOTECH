#!/usr/bin/env bash
# One-time setup for the lead-capture backend (scripts/lead-intake.py).
# Run as root on the VPS, from inside the repo checkout (/var/www/globaltechtour).
#
# Reuses the same Telegram bot/chat as claude-control's command-poller
# (/etc/claude-control.env) rather than provisioning a new bot — it
# already reliably reaches the admin's Telegram.
set -euo pipefail

ENV_FILE="/etc/globaltechtour-lead.env"
SERVICE_FILE="/etc/systemd/system/globaltechtour-lead.service"
APP_DIR="/var/www/globaltechtour"

if [ -f "$ENV_FILE" ]; then
  echo "==> $ENV_FILE уже существует, оставляем как есть"
else
  if [ ! -f /etc/claude-control.env ]; then
    echo "!! /etc/claude-control.env не найден — впишите TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID в $ENV_FILE вручную"
    touch "$ENV_FILE"
  else
    # shellcheck disable=SC1091
    source /etc/claude-control.env
    cat >"$ENV_FILE" <<EOF
TELEGRAM_BOT_TOKEN=${COMMAND_BOT_TOKEN}
TELEGRAM_CHAT_ID=${ALLOWED_CHAT_ID}
EOF
  fi
  chmod 600 "$ENV_FILE"
fi

touch /var/log/globaltechtour-lead.log

cat >"$SERVICE_FILE" <<EOF
[Unit]
Description=Global Tech Tour lead-capture backend
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}/scripts
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/python3 ${APP_DIR}/scripts/lead-intake.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now globaltechtour-lead
systemctl status globaltechtour-lead --no-pager

echo ""
echo "=== Сервис поднят на 127.0.0.1:8090 ==="
echo "Осталось добавить в nginx-конфиг globaltechtour.ru location-блок:"
echo ""
echo '    location /api/lead {'
echo '        proxy_pass http://127.0.0.1:8090;'
echo '        proxy_set_header X-Real-IP $remote_addr;'
echo '    }'
echo ""
echo "Добавьте его в HTTPS server-блок /etc/nginx/sites-available/globaltechtour.ru, затем:"
echo "  nginx -t && systemctl reload nginx"
