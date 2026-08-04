#!/usr/bin/env bash
# Добавляет 301-редирект www.globaltechtour.ru (и globaltechtour.com /
# www.globaltechtour.com) -> https://globaltechtour.ru. До этой правки
# deploy-vps.sh отдавал одинаковый контент на globaltechtour.ru и на
# www.globaltechtour.ru без редиректа между ними — из-за этого Яндекс.
# Вебмастер видел их как два разных сайта (canonical-домен сайта —
# globaltechtour.ru без www, см. Sitemap: в public/robots.txt).
# Запускать один раз, ПОСЛЕ того как certbot уже выпустил сертификат
# (см. подсказку в конце deploy-vps.sh), через SSH на VPS от имени root.
# Если nginx -t упадёт на пути к сертификату — проверить актуальный путь
# командой `certbot certificates` и поправить ssl_certificate* ниже.
set -e

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
        try_files $uri $uri/ /index.html;
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
    server_name globaltechtour.ru www.globaltechtour.ru globaltechtour.com www.globaltechtour.com;
    return 301 https://globaltechtour.ru$request_uri;
}
EOF

nginx -t
systemctl reload nginx

echo ""
echo "=== ГОТОВО ==="
echo "Проверка: curl -I https://www.globaltechtour.ru/  (должен вернуть 301 -> https://globaltechtour.ru/)"
