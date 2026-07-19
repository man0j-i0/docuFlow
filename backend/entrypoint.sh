#!/bin/sh
set -e

# Only the API applies migrations. The worker shares this entrypoint but must
# not race the API to the schema, so it opts out via RUN_MIGRATIONS=0.
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  echo "==> applying migrations"
  python manage.py migrate --noinput
fi

exec "$@"
