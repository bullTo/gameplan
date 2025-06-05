# Authentication Function Documentation

## Overview

The authentication function (`auth.js`) is a Netlify serverless function that handles user authentication for the GamePlan AI application. It provides endpoints for user registration and login.

## Function Structure

The function uses a single endpoint with different actions specified in the request body:

```
/.netlify/functions/auth
```

## Authentication Actions

### 1. User Registration

Registers a new user in the system.

**Request:**
```json
{
  "action": "register",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "agreeToTerms": true
}
```

**Response (Success - 201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "123",
    "email": "john@example.com",
    "name": "John Doe",
    "subscription_plan": "free"
  },
  "token": "jwt_token_here"
}
```

**Response (Error - 400/409/500):**
```json
{
  "error": "Error message here"
}
```

### 2. User Login

Authenticates a user and returns a JWT token.

**Request:**
```json
{
  "action": "login",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "rememberMe": true
}
```

**Response (Success - 200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "123",
    "email": "john@example.com",
    "name": "John Doe",
    "subscription_plan": "free"
  },
  "token": "jwt_token_here"
}
```

**Response (Error - 400/401/500):**
```json
{
  "error": "Error message here"
}
```

## Error Codes

- **400** - Bad Request (missing or invalid parameters)
- **401** - Unauthorized (invalid credentials)
- **409** - Conflict (user already exists)
- **500** - Internal Server Error

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt before storage
2. **JWT Authentication**: JSON Web Tokens are used for stateless authentication
3. **Input Validation**: Email and password formats are validated
4. **Error Handling**: Generic error messages to prevent information leakage

## Environment Variables

The function requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string for Neon DB
- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRY`: Token expiration time (default: "7d")

## Database Schema

The function interacts with the following database tables:

1. `users` - Stores user information and authentication data
   - `id`: User ID (primary key)
   - `name`: User's full name
   - `email`: User's email address (unique)
   - `password_hash`: Bcrypt-hashed password
   - `created_at`: Account creation timestamp
   - `updated_at`: Account update timestamp
   - `last_login`: Last login timestamp
   - `subscription_plan`: User's subscription level
   - Additional fields for subscription management

## Client Integration

The frontend interacts with this function through the `auth.ts` API client, which provides the following methods:

- `loginUser(credentials)`: Authenticates a user
- `registerUser(data)`: Registers a new user
- `getAuthToken()`: Retrieves the stored JWT token
- `isAuthenticated()`: Checks if the user is authenticated
- `getUserData()`: Retrieves the stored user data
- `logoutUser()`: Removes authentication data

## Future Enhancements

1. Password reset functionality
2. Email verification
3. Social authentication (Google, Facebook, etc.)
4. Two-factor authentication
5. Rate limiting to prevent brute force attacks
