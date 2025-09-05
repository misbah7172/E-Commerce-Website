#!/bin/bash

# Build script for Render deployment

echo "Starting build process..."

# Install dependencies
npm install

# Build the frontend (Vite)
npm run build

echo "Build completed successfully!"

# Optional: Run any post-build tasks
# npm run db:push  # Uncomment if you want to push database schema on build
