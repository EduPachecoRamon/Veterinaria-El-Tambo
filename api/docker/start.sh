#!/bin/sh
set -eu
PORT="${PORT:-10000}"
sed -i "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/\*:10000/\*:${PORT}/" /etc/apache2/sites-available/000-default.conf
if [ -z "${APP_KEY:-}" ]; then
  echo "Falta APP_KEY en variables de entorno." >&2
  exit 1
fi
php artisan package:discover --ansi
php artisan config:cache
exec apache2-foreground
