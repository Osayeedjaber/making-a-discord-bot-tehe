#!/bin/bash

# Discord Bot Development Startup Script
echo "Starting Discord Bot in development mode..."

# Set environment variables
export NODE_ENV=development

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    yarn install
fi

# Start the bot with hot reload
echo "Starting bot with hot reload..."
yarn dev