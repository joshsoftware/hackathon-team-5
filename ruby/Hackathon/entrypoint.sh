#!/bin/bash
set -e

echo "Starting entrypoint script..."

# Max number of retries
MAX_RETRIES=30
count=0

# Remove server.pid
if [ -f /app/tmp/pids/server.pid ]; then
    echo "Removing stale server.pid..."
    rm -f /app/tmp/pids/server.pid
fi

# Wait for Redis
until redis-cli -h redisdb ping >/dev/null 2>&1; do
    echo "Waiting for Redis... (${count}/${MAX_RETRIES})"
    count=$((count+1))
    if [ $count -gt $MAX_RETRIES ]; then
        echo "Timeout waiting for Redis"
        exit 1
    fi
    sleep 2
done

echo "Services are ready - executing command"
exec "$@"