#!/bin/bash

# Discord Bot Startup Script
echo "Starting Discord Bot..."

# Set environment variables
export NODE_ENV=production

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    yarn install
fi

# Build TypeScript
echo "Building TypeScript..."
yarn build

# Start the bot
echo "Starting bot..."
yarn start