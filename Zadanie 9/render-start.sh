#!/bin/sh
set -eu

: "${PORT:=10000}"
: "${API_PORT:=5000}"
export API_PORT

sed "s/\${PORT}/${PORT}/g" \
  /etc/nginx/templates/default.conf.template \
  > /etc/nginx/http.d/default.conf

node /app/server/src/index.js &

exec nginx -g "daemon off;"
