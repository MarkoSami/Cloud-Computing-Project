#!/bin/bash

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U admin; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is ready!"

echo "Preparing database..."
# Clean approach - handle migration issues
npx prisma generate
rm -rf ./prisma/migrations
npx prisma migrate dev --name init --create-only
npx prisma migrate deploy

echo "Starting application..."
exec "$@" 