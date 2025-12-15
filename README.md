# Repset API

A full-stack application with Django REST Framework backend and React (Vite) frontend, containerized with Docker.

## Project Structure

```
repset-api-backend/
├── docker-compose.yml    # Docker Compose configuration
├── .env.example          # Environment variables template
├── backend/              # Django REST Framework API
│   ├── Dockerfile
│   ├── manage.py
│   ├── requirements.txt
│   ├── core/             # Django project settings
│   ├── account/          # User authentication app
│   └── docs/             # API documentation
└── frontend/             # React + Vite + TypeScript
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
```

## Quick Start with Docker

### 1. Clone and setup environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings (optional for local development)
```

### 2. Start all services

```bash
# Build and start all containers
docker compose up

# Or run in background
docker compose up -d
```

### 3. Run database migrations

```bash
docker compose exec backend python manage.py migrate
```

### 4. Create a superuser (optional)

```bash
docker compose exec backend python manage.py createsuperuser
```

## Access Points

| Service     | URL                         | Description        |
| ----------- | --------------------------- | ------------------ |
| Frontend    | http://localhost:5173       | React application  |
| Backend API | http://localhost:8000/api   | Django REST API    |
| Admin       | http://localhost:8000/admin | Django admin panel |
| Database    | localhost:5432              | PostgreSQL         |

## Development

### Stopping services

```bash
docker compose down
```

### Viewing logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Rebuilding containers

```bash
# After changing Dockerfile or dependencies
docker compose build

# Or rebuild and start
docker compose up --build
```

### Running backend commands

```bash
# Django shell
docker compose exec backend python manage.py shell

# Run tests
docker compose exec backend python manage.py test

# Create new migrations
docker compose exec backend python manage.py makemigrations
```

### Running frontend commands

```bash
# Install new packages
docker compose exec frontend npm install <package-name>

# Run linter
docker compose exec frontend npm run lint
```

## Local Development (without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp ../.env.example .env
# Edit .env as needed

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## API Endpoints

| Endpoint              | Method | Auth | Description               |
| --------------------- | ------ | ---- | ------------------------- |
| `/api/auth/register/` | POST   | No   | Create new user           |
| `/api/auth/login/`    | POST   | No   | Login and get JWT cookies |
| `/api/auth/logout/`   | POST   | Yes  | Logout and clear cookies  |
| `/api/auth/refresh/`  | POST   | No   | Refresh access token      |
| `/api/auth/me/`       | GET    | Yes  | Get current user          |
| `/api/auth/csrf/`     | GET    | No   | Get CSRF token            |
| `/api/profile/`       | GET    | Yes  | Get user profile          |

## Environment Variables

| Variable               | Description               | Default                 |
| ---------------------- | ------------------------- | ----------------------- |
| `SECRET_KEY`           | Django secret key         | Required                |
| `DEBUG`                | Enable debug mode         | `True`                  |
| `ALLOWED_HOSTS`        | Allowed host headers      | `localhost,127.0.0.1`   |
| `POSTGRES_DB`          | Database name             | `repset`                |
| `POSTGRES_USER`        | Database user             | `repset`                |
| `POSTGRES_PASSWORD`    | Database password         | `repset`                |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins      | `http://localhost:5173` |
| `JWT_COOKIE_SECURE`    | Require HTTPS for cookies | `False`                 |
