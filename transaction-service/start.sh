#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."
# Wait for Postgres to be ready - retry up to 30 times with 2 second delay
MAX_RETRIES=30
RETRY_COUNT=0

until pg_isready -h postgres -p 5432 -U admin || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  echo "Waiting for PostgreSQL to be ready... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
  RETRY_COUNT=$((RETRY_COUNT+1))
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "Error: PostgreSQL did not become ready in time."
  exit 1
fi

echo "PostgreSQL is ready!"
echo "Running migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm start 