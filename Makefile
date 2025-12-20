.PHONY: help install up down restart build logs shell test migrate makemigrations createsuperuser clean clean-all setup frontend-install frontend-build frontend-lint backend-shell backend-test backend-collectstatic demo-check demo-init demo-clear demo-load demo-reset

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Docker Compose operations
up: ## Start all services
	docker compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"

up-build: ## Build and start all services
	docker compose up -d --build
	@echo "$(GREEN)✓ Services built and started$(NC)"

down: ## Stop all services
	docker compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	docker compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

build: ## Build all Docker images
	docker compose build
	@echo "$(GREEN)✓ Images built$(NC)"

logs: ## Show logs from all services
	docker compose logs -f

logs-backend: ## Show backend logs
	docker compose logs -f backend

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

logs-db: ## Show database logs
	docker compose logs -f db

# Database operations
migrate: ## Run database migrations
	docker compose exec backend python manage.py migrate
	@echo "$(GREEN)✓ Migrations applied$(NC)"

makemigrations: ## Create new database migrations
	docker compose exec backend python manage.py makemigrations
	@echo "$(GREEN)✓ Migrations created$(NC)"

migrate-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(YELLOW)⚠ This will delete all database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker compose up -d db; \
		sleep 5; \
		docker compose exec backend python manage.py migrate; \
		echo "$(GREEN)✓ Database reset$(NC)"; \
	fi

# Django management commands
createsuperuser: ## Create a Django superuser
	docker compose exec backend python manage.py createsuperuser

shell: ## Open Django shell
	docker compose exec backend python manage.py shell

dbshell: ## Open database shell
	docker compose exec backend python manage.py dbshell

collectstatic: ## Collect static files
	docker compose exec backend python manage.py collectstatic --noinput
	@echo "$(GREEN)✓ Static files collected$(NC)"

# Testing
test: ## Run backend tests
	docker compose exec backend python manage.py test
	@echo "$(GREEN)✓ Tests completed$(NC)"

test-verbose: ## Run backend tests with verbose output
	docker compose exec backend python manage.py test --verbosity=2

test-coverage: ## Run tests with coverage report
	docker compose exec backend sh -c "pip install coverage && coverage run --source='.' manage.py test && coverage report"

# Frontend operations
frontend-install: ## Install frontend dependencies
	docker compose exec frontend npm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

frontend-build: ## Build frontend for production
	docker compose exec frontend npm run build
	@echo "$(GREEN)✓ Frontend built$(NC)"

frontend-lint: ## Lint frontend code
	docker compose exec frontend npm run lint

frontend-shell: ## Open shell in frontend container
	docker compose exec frontend sh

# Backend operations
backend-shell: ## Open shell in backend container
	docker compose exec backend sh

backend-test: ## Run backend tests (alias for test)
	$(MAKE) test

backend-collectstatic: ## Collect static files (alias for collectstatic)
	$(MAKE) collectstatic

# Setup and installation
setup: ## Initial setup: copy .env, build, migrate, create superuser
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✓ Created .env file from .env.example$(NC)"; \
	fi
	docker compose build
	docker compose up -d db
	@echo "$(YELLOW)Waiting for database to be ready...$(NC)"
	@sleep 5
	docker compose up -d
	@sleep 3
	docker compose exec backend python manage.py migrate
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo "$(BLUE)Run 'make createsuperuser' to create an admin user$(NC)"

install: ## Install dependencies (alias for setup)
	$(MAKE) setup

# Cleanup operations
clean: ## Remove stopped containers and unused images
	docker compose down
	docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-all: ## Remove all containers, volumes, and images (WARNING: deletes all data)
	@echo "$(YELLOW)⚠ This will delete all containers, volumes, and images!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v --rmi all; \
		docker system prune -af --volumes; \
		echo "$(GREEN)✓ Complete cleanup done$(NC)"; \
	fi

clean-volumes: ## Remove all volumes (WARNING: deletes database data)
	@echo "$(YELLOW)⚠ This will delete all database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		echo "$(GREEN)✓ Volumes removed$(NC)"; \
	fi

# Development shortcuts
dev: ## Start development environment (up + logs)
	docker compose up -d
	@echo "$(GREEN)✓ Development environment started$(NC)"
	@echo "$(BLUE)View logs with: make logs$(NC)"

status: ## Show status of all services
	docker compose ps

# Quick access URLs
urls: ## Show access URLs
	@echo "$(BLUE)Access URLs:$(NC)"
	@echo "  Frontend:    http://localhost:5173"
	@echo "  Backend API: http://localhost:8000/api"
	@echo "  Admin:       http://localhost:8000/admin"
	@echo "  Database:    localhost:5432"

# Demo data management (Snaplet)
demo-check: ## Internal: Check DEMO_MODE environment variable
	@if [ "$(DEMO_MODE)" != "true" ]; then \
		echo "$(YELLOW)ERROR: DEMO_MODE environment variable is not set to 'true'$(NC)"; \
		echo "$(YELLOW)This command is only allowed in demo environments.$(NC)"; \
		echo "$(YELLOW)Set DEMO_MODE=true to proceed.$(NC)"; \
		exit 1; \
	fi

demo-init: demo-check ## Initialize Snaplet config and extract enums
	@echo "$(BLUE)Initializing Snaplet configuration...$(NC)"
	docker compose exec backend python manage.py extract_enums --output /snaplet/.snaplet/enums.json
	docker compose run --rm snaplet sh -c "cd /app && npm install && npx @snaplet/seed init --adapter postgres && npm run sync"
	@echo "$(GREEN)✓ Snaplet configuration initialized$(NC)"

demo-clear: demo-check ## Clear all demo data (WARNING: deletes all data)
	@echo "$(YELLOW)⚠ This will delete all demo data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Clearing demo data...$(NC)"; \
		docker compose exec backend python manage.py shell -c " \
			from training.models import WorkoutSet, WorkoutExercise, Workout, UserTrainingPreferences; \
			from account.models import User; \
			from gym.models import GymEquipment; \
			from catalog.models import Exercise, Equipment; \
			from gym.models import Gym; \
			WorkoutSet.objects.all().delete(); \
			WorkoutExercise.objects.all().delete(); \
			Workout.objects.all().delete(); \
			UserTrainingPreferences.objects.all().delete(); \
			User.objects.filter(is_staff=False).delete(); \
			GymEquipment.objects.all().delete(); \
			Exercise.objects.all().delete(); \
			Equipment.objects.all().delete(); \
			Gym.objects.all().delete(); \
			print('Demo data cleared'); \
		"; \
		echo "$(GREEN)✓ Demo data cleared$(NC)"; \
	fi

demo-load: demo-check ## Generate fresh demo data using Snaplet
	@echo "$(BLUE)Generating demo data with Snaplet...$(NC)"
	@if [ ! -f snaplet/.snaplet/enums.json ]; then \
		echo "$(YELLOW)Enums file not found. Running demo-init first...$(NC)"; \
		$(MAKE) demo-init DEMO_MODE=true; \
	fi
	docker compose run --rm -e DEMO_MODE=true snaplet npm run seed
	@echo "$(GREEN)✓ Demo data generated$(NC)"

demo-reset: demo-check ## Clear and reload demo data
	@echo "$(BLUE)Resetting demo data...$(NC)"
	$(MAKE) demo-clear DEMO_MODE=true
	$(MAKE) demo-load DEMO_MODE=true
	@echo "$(GREEN)✓ Demo data reset complete$(NC)"
