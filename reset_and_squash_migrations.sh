#!/bin/bash

# Script to nuke database, squash migrations, and reapply for account, gym, training, and catalog apps
# This script should be run from the project root directory

echo "🚀 Starting database reset and migration squash process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Set defaults for database credentials
POSTGRES_USER=${POSTGRES_USER:-repset}
POSTGRES_DB=${POSTGRES_DB:-repset}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-repset}

# Check if Docker Compose is running
if ! docker compose ps 2>/dev/null | grep -q "backend"; then
    echo -e "${YELLOW}⚠️  Docker containers are not running. Starting them...${NC}"
    docker compose up -d
    echo "⏳ Waiting for services to be ready..."
    sleep 5
fi

# Step 1: Delete all migration files except __init__.py for each app
echo -e "\n${YELLOW}Step 1: Removing old migration files...${NC}"

# Order matters due to dependencies:
# - catalog: no dependencies
# - gym: depends on catalog
# - account: depends on gym
# - training: depends on account, gym, catalog
APPS=("catalog" "gym" "account" "training")

for app in "${APPS[@]}"; do
    MIGRATIONS_DIR="backend/${app}/migrations"
    
    if [ -d "$MIGRATIONS_DIR" ]; then
        echo "  Removing migrations from ${app}..."
        # Find and remove all migration files except __init__.py
        find "$MIGRATIONS_DIR" -type f -name "*.py" ! -name "__init__.py" -delete
        echo -e "  ${GREEN}✓${NC} Cleaned ${app}/migrations/"
    else
        echo -e "  ${YELLOW}⚠️  ${MIGRATIONS_DIR} does not exist, skipping...${NC}"
    fi
done

# Step 2: Drop and recreate the database (nuclear option)
echo -e "\n${YELLOW}Step 2: Dropping and recreating database...${NC}"
echo -e "${RED}⚠️  This will delete ALL data in the database!${NC}"

# Drop the database (connect to postgres database to drop the target database)
docker compose exec -T db psql -U "${POSTGRES_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};" 2>/dev/null || {
    echo -e "${YELLOW}  Note: Database may not exist yet${NC}"
}

# Recreate the database
docker compose exec -T db psql -U "${POSTGRES_USER}" -d postgres -c "CREATE DATABASE ${POSTGRES_DB};" 2>/dev/null || {
    echo -e "${RED}  Error: Failed to create database. It may already exist.${NC}"
}

echo -e "${GREEN}✓${NC} Database recreated"

# Step 3: Create new initial migrations
echo -e "\n${YELLOW}Step 3: Creating new initial migrations...${NC}"

for app in "${APPS[@]}"; do
    echo "  Creating migrations for ${app}..."
    docker compose exec -T backend python manage.py makemigrations "${app}" || {
        echo -e "  ${YELLOW}⚠️  No migrations needed for ${app} (app may not be in INSTALLED_APPS)${NC}"
    }
done

# Step 4: Apply migrations
echo -e "\n${YELLOW}Step 4: Applying migrations...${NC}"
docker compose exec -T backend python manage.py migrate

echo -e "\n${GREEN}✅ Success! Database has been reset and migrations have been squashed and reapplied.${NC}"
echo -e "\nSummary:"
echo "  - Database has been dropped and recreated"
echo "  - All migration files (except __init__.py) have been removed"
echo "  - New initial migrations have been created"
echo "  - Migrations have been applied"
