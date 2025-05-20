#!/bin/sh

# Blogify Production Startup Script

# Set environment variables if not already set
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-12001}

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
  echo "No .env file found, creating from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
  else
    echo "Warning: No .env.example file found. Environment variables must be set externally."
  fi
fi

# Wait for MongoDB to be ready if MONGODB_URI is set
if [ -n "$MONGODB_URI" ]; then
  echo "Waiting for MongoDB to be ready..."
  MAX_RETRIES=30
  RETRY_INTERVAL=2
  
  for i in $(seq 1 $MAX_RETRIES); do
    # Extract host and port from MONGODB_URI
    if echo "$MONGODB_URI" | grep -q "mongodb://"; then
      # Handle standard mongodb:// URI
      HOST=$(echo "$MONGODB_URI" | sed -E 's|mongodb://([^:@/]+)(:[^@/]+)?@?([^:/]+)(:[0-9]+)?/.*|\3|')
      PORT=$(echo "$MONGODB_URI" | sed -E 's|.*:([0-9]+)/.*|\1|')
      PORT=${PORT:-27017}
    elif echo "$MONGODB_URI" | grep -q "mongodb+srv://"; then
      # For MongoDB Atlas, we can't easily check connectivity
      echo "MongoDB Atlas URI detected, skipping connection check"
      break
    else
      echo "Unrecognized MongoDB URI format"
      break
    fi
    
    # Try to connect to MongoDB
    if nc -z -w 1 "$HOST" "$PORT" 2>/dev/null; then
      echo "MongoDB is ready!"
      break
    fi
    
    echo "Waiting for MongoDB... ($i/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
    
    if [ $i -eq $MAX_RETRIES ]; then
      echo "Warning: Could not connect to MongoDB after $MAX_RETRIES attempts"
    fi
  done
fi

# Start the server
echo "Starting Blogify in production mode..."
node src/server.js