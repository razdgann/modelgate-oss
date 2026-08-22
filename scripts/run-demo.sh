#!/bin/sh
set -eu
DEMO_DB="${MODELGATE_DEMO_DATABASE:-./data/modelgate-demo.db}"
node scripts/create-demo-data.js "$DEMO_DB"
echo "Starting the clearly labeled demo at http://localhost:3000"
MODELGATE_DATABASE_URL="$DEMO_DB" MODELGATE_DEMO_MODE=true node src/server.js
