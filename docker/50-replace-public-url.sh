#!/bin/sh

PUBLIC_URL=${PUBLIC_URL:-}
find /usr/share/nginx/html -type f -exec sed -i "s#@@PUBLIC_URL@@#$PUBLIC_URL#g" '{}' \;
