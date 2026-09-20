#!/usr/bin/env sh
# Railway / container entry — apply migrations then serve.
set -eu
./node_modules/.bin/prisma migrate deploy
exec node dist/index.js
