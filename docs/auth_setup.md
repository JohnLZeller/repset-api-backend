# Authentication System Setup

This document describes how to set up and use the JWT-based authentication system.

## Quick Start

### 1. Create and activate virtual environment

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment (macOS/Linux)
source .venv/bin/activate

# Activate virtual environment (Windows)
# .venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
# At minimum, generate a new SECRET_KEY for production
```

To generate a secure SECRET_KEY:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Run database migrations

```bash
python manage.py migrate
```

### 5. Create a superuser (optional)

```bash
python manage.py createsuperuser
```

### 6. Run the development server

```bash
python manage.py runserver
```

The API is now available at `http://localhost:8000/api/`.

## Running Tests

```bash
python manage.py test account
```

## API Endpoints

| Endpoint              | Method | Auth Required | Description                                   |
| --------------------- | ------ | ------------- | --------------------------------------------- |
| `/api/auth/register/` | POST   | No            | Create a new user account                     |
| `/api/auth/login/`    | POST   | No            | Authenticate and receive JWT cookies          |
| `/api/auth/logout/`   | POST   | Yes           | Invalidate tokens and clear cookies           |
| `/api/auth/refresh/`  | POST   | No            | Refresh access token using refresh cookie     |
| `/api/auth/me/`       | GET    | Yes           | Get current authenticated user                |
| `/api/auth/csrf/`     | GET    | No            | Get CSRF token for unsafe requests            |
| `/api/profile/`       | GET    | Yes           | Get user profile (example protected endpoint) |

## Authentication Flow

### How It Works

1. **Registration/Login**: User submits credentials to `/api/auth/register/` or `/api/auth/login/`.

2. **Token Issuance**: Server validates credentials and issues two JWT tokens:

   - **Access Token** (short-lived, 5 minutes): Used for authenticating API requests
   - **Refresh Token** (long-lived, 7 days): Used to obtain new access tokens

3. **Cookie Storage**: Both tokens are stored in HttpOnly, Secure cookies. This prevents JavaScript from accessing the tokens, protecting against XSS attacks.

4. **Authenticated Requests**: The browser automatically sends cookies with each request. The server extracts and validates the access token from the cookie.

5. **Token Refresh**: When the access token expires, the frontend calls `/api/auth/refresh/`. The server reads the refresh token from the cookie, validates it, and issues a new access token.

6. **Logout**: The user calls `/api/auth/logout/`. The server blacklists the refresh token and clears the cookies.

### Token Rotation

When a refresh token is used, it is blacklisted and a new refresh token is issued. This limits the damage if a refresh token is compromised.

## Security Considerations

### Cookies

- **HttpOnly**: Tokens cannot be accessed via JavaScript (XSS protection)
- **Secure**: Cookies only sent over HTTPS (set `JWT_COOKIE_SECURE=False` for local development)
- **SameSite=Lax**: Provides CSRF protection for most cases

### CSRF Protection

For browser-based clients making unsafe requests (POST, PUT, DELETE), you need to:

1. Call `/api/auth/csrf/` to get a CSRF token
2. Include the token in the `X-CSRFToken` header for subsequent requests

### CORS Configuration

Set `CORS_ALLOWED_ORIGINS` in your `.env` file to the origins that should be allowed to access the API:

```
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourfrontend.com
```

## Environment Variables

| Variable               | Description                                  | Default                 |
| ---------------------- | -------------------------------------------- | ----------------------- |
| `SECRET_KEY`           | Django secret key (required)                 | -                       |
| `DEBUG`                | Enable debug mode                            | `False`                 |
| `ALLOWED_HOSTS`        | Comma-separated list of allowed hosts        | `localhost,127.0.0.1`   |
| `DATABASE_URL`         | Database connection URL                      | SQLite                  |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:3000` |
| `JWT_COOKIE_SECURE`    | Require HTTPS for cookies                    | `True`                  |

## Token Lifetimes

Default token lifetimes (configurable in `settings.py`):

- Access Token: 5 minutes
- Refresh Token: 7 days

These can be adjusted in the `SIMPLE_JWT` settings in `core/settings.py`.
