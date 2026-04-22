#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing schema to database..."
npx prisma db push --accept-data-loss

echo "Seeding database..."
npx tsx src/seed.ts

echo "Starting API server..."
exec node dist/index.js
