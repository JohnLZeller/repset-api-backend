# Frontend Authentication Examples

This document provides examples of how to integrate a frontend application (e.g., React, Vue, or vanilla JavaScript) with the JWT authentication API.

## Important: Credentials Mode

All requests must include `credentials: "include"` to send and receive cookies:

```javascript
fetch(url, {
  credentials: "include", // Required for cookies
  // ... other options
});
```

## Getting a CSRF Token

Before making unsafe requests (POST, PUT, DELETE), get a CSRF token:

```javascript
async function getCsrfToken() {
  const response = await fetch("http://localhost:8000/api/auth/csrf/", {
    credentials: "include",
  });
  const data = await response.json();
  return data.csrfToken;
}
```

## User Registration

```javascript
async function register(email, password, fullName = "") {
  const csrfToken = await getCsrfToken();

  const response = await fetch("http://localhost:8000/api/auth/register/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      email: email,
      password: password,
      password_confirm: password,
      full_name: fullName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();
  console.log("Registration successful:", data.user);
  return data.user;
}

// Usage
register("user@example.com", "SecurePassword123!", "John Doe")
  .then((user) => console.log("Registered:", user))
  .catch((err) => console.error("Registration failed:", err));
```

## User Login

```javascript
async function login(email, password) {
  const csrfToken = await getCsrfToken();

  const response = await fetch("http://localhost:8000/api/auth/login/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error("Login failed: Invalid credentials");
  }

  const data = await response.json();
  console.log("Login successful:", data.user);
  return data.user;
}

// Usage
login("user@example.com", "SecurePassword123!")
  .then((user) => console.log("Logged in as:", user.email))
  .catch((err) => console.error(err));
```

## Making Authenticated Requests

After login, cookies are automatically sent with requests:

```javascript
async function getProfile() {
  const response = await fetch("http://localhost:8000/api/profile/", {
    credentials: "include",
  });

  if (response.status === 401) {
    // Token expired or not logged in
    throw new Error("Not authenticated");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return await response.json();
}

// Usage
getProfile()
  .then((profile) => console.log("Profile:", profile))
  .catch((err) => console.error(err));
```

## Getting Current User

```javascript
async function getCurrentUser() {
  const response = await fetch("http://localhost:8000/api/auth/me/", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null; // Not logged in
  }

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return await response.json();
}

// Usage - check if user is logged in on page load
getCurrentUser().then((user) => {
  if (user) {
    console.log("Logged in as:", user.email);
  } else {
    console.log("Not logged in");
  }
});
```

## Token Refresh

Call this when you receive a 401 response to try refreshing the token:

```javascript
async function refreshToken() {
  const csrfToken = await getCsrfToken();

  const response = await fetch("http://localhost:8000/api/auth/refresh/", {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });

  return response.ok;
}

// Example: Wrapper with automatic token refresh
async function fetchWithRefresh(url, options = {}) {
  options.credentials = "include";

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Try to refresh the token
    const refreshed = await refreshToken();

    if (refreshed) {
      // Retry the original request
      response = await fetch(url, options);
    }
  }

  return response;
}

// Usage
fetchWithRefresh("http://localhost:8000/api/profile/")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## User Logout

```javascript
async function logout() {
  const csrfToken = await getCsrfToken();

  const response = await fetch("http://localhost:8000/api/auth/logout/", {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  console.log("Logged out successfully");
  // Redirect to login page or update UI state
}

// Usage
logout()
  .then(() => (window.location.href = "/login"))
  .catch((err) => console.error(err));
```

## React Hook Example

Here's a simple React hook for authentication:

```javascript
import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8000/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/me/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const getCsrfToken = useCallback(async () => {
    const res = await fetch(`${API_BASE}/auth/csrf/`, {
      credentials: "include",
    });
    const data = await res.json();
    return data.csrfToken;
  }, []);

  const login = useCallback(
    async (email, password) => {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      setUser(data.user);
      return data.user;
    },
    [getCsrfToken]
  );

  const logout = useCallback(async () => {
    const csrfToken = await getCsrfToken();
    await fetch(`${API_BASE}/auth/logout/`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": csrfToken },
    });
    setUser(null);
  }, [getCsrfToken]);

  const register = useCallback(
    async (email, password, fullName = "") => {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          email,
          password,
          password_confirm: password,
          full_name: fullName,
        }),
      });

      if (!res.ok) throw new Error("Registration failed");

      const data = await res.json();
      setUser(data.user);
      return data.user;
    },
    [getCsrfToken]
  );

  return { user, loading, login, logout, register };
}

// Usage in a component:
// const { user, loading, login, logout } = useAuth();
```

## Error Handling

The API returns errors in this format:

```json
{
  "field_name": ["Error message 1", "Error message 2"],
  "non_field_errors": ["General error message"]
}
```

Example error handling:

```javascript
async function handleLogin(email, password) {
  try {
    const user = await login(email, password);
    // Success - redirect or update state
  } catch (error) {
    const errors = JSON.parse(error.message);

    if (errors.email) {
      console.error("Email error:", errors.email.join(", "));
    }
    if (errors.password) {
      console.error("Password error:", errors.password.join(", "));
    }
    if (errors.non_field_errors) {
      console.error("Error:", errors.non_field_errors.join(", "));
    }
  }
}
```

## CORS Configuration

Ensure your backend has the correct CORS settings for your frontend origin:

```
# In .env
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourapp.com
```

The backend already has `CORS_ALLOW_CREDENTIALS=True` set, which is required for cookies to work cross-origin.
