# GamePlan AI API Documentation

This document provides detailed information about the API endpoints available in the GamePlan AI platform. These endpoints are implemented as Netlify Functions and are used by the frontend to interact with the backend.

## Base URL

All API endpoints are relative to the base URL:

```
/.netlify/functions/
```

## Authentication

Most API endpoints require authentication. To authenticate, include a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

You can obtain a token by calling the `/auth` endpoint with valid credentials.

## Error Handling

All API endpoints return JSON responses with the following structure in case of an error:

```json
{
  "error": "Error message"
}
```

The HTTP status code will indicate the type of error:

- `400`: Bad Request - The request was invalid
- `401`: Unauthorized - Authentication is required
- `403`: Forbidden - The user does not have permission to access the resource
- `404`: Not Found - The requested resource was not found
- `500`: Internal Server Error - An error occurred on the server

## API Endpoints

### Authentication

#### Login

```
POST /.netlify/functions/auth
```

Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "subscription_plan": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Register

```
POST /.netlify/functions/auth
```

Registers a new user.

**Request Body:**

```json
{
  "action": "register",
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "subscription_plan": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Reset Password

```
POST /.netlify/functions/auth
```

Initiates a password reset.

**Request Body:**

```json
{
  "action": "reset-password",
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset email sent"
}
```

### Admin Authentication

#### Admin Login

```
POST /.netlify/functions/admin-auth
```

Authenticates an admin user and returns a JWT token.

**Request Body:**

```json
{
  "action": "login",
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

**Response:**

```json
{
  "message": "Admin login successful",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Verify Admin Token

```
POST /.netlify/functions/admin-auth
```

Verifies an admin token.

**Request Body:**

```json
{
  "action": "verify"
}
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Token is valid",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### User Management (Admin)

#### Get Users

```
GET /.netlify/functions/admin-users
```

Gets a list of users with pagination and filtering.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Number of users per page (default: 10)
- `search`: Search term for name or email
- `subscription_plan`: Filter by subscription plan
- `sort_by`: Sort by field (default: created_at)
- `sort_order`: Sort order (asc or desc, default: desc)

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "subscription_plan": "free",
      "created_at": "2023-01-01T00:00:00Z",
      "last_login": "2023-01-02T00:00:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### Create User

```
POST /.netlify/functions/admin-users
```

Creates a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "subscription_plan": "free"
}
```

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "subscription_plan": "free",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### Update User

```
PUT /.netlify/functions/admin-users
```

Updates a user.

**Request Body:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "newpassword",
  "subscription_plan": "core"
}
```

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "subscription_plan": "core",
    "created_at": "2023-01-01T00:00:00Z",
    "last_login": "2023-01-02T00:00:00Z"
  }
}
```

#### Delete User

```
DELETE /.netlify/functions/admin-users?id=1
```

Deletes a user.

**Query Parameters:**

- `id`: User ID

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

### Subscription Management (Admin)

#### Get Subscription Plans

```
GET /.netlify/functions/admin-subscriptions/plans
```

Gets a list of subscription plans.

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "plans": [
    {
      "id": 1,
      "name": "Free",
      "key": "free",
      "price": 0,
      "billing_cycle": "monthly",
      "features": ["3 AI prompts per day", "Basic predictions", "No tracker access"],
      "is_default": true,
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    ...
  ]
}
```

#### Create Subscription Plan

```
POST /.netlify/functions/admin-subscriptions/plans
```

Creates a new subscription plan.

**Request Body:**

```json
{
  "name": "Premium",
  "key": "premium",
  "price": 149,
  "billing_cycle": "monthly",
  "features": ["50 AI prompts per day", "Premium predictions", "Advanced tracker", "Priority support", "Custom recommendations"],
  "is_default": false,
  "is_active": true
}
```

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "message": "Subscription plan created successfully",
  "plan": {
    "id": 6,
    "name": "Premium",
    "key": "premium",
    "price": 149,
    "billing_cycle": "monthly",
    "features": ["50 AI prompts per day", "Premium predictions", "Advanced tracker", "Priority support", "Custom recommendations"],
    "is_default": false,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

#### Update Subscription Plan

```
PUT /.netlify/functions/admin-subscriptions/plans
```

Updates a subscription plan.

**Request Body:**

```json
{
  "id": 6,
  "name": "Premium Plus",
  "key": "premium",
  "price": 199,
  "billing_cycle": "monthly",
  "features": ["Unlimited AI prompts", "Premium predictions", "Advanced tracker", "Priority support", "Custom recommendations"],
  "is_default": false,
  "is_active": true
}
```

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "message": "Subscription plan updated successfully",
  "plan": {
    "id": 6,
    "name": "Premium Plus",
    "key": "premium",
    "price": 199,
    "billing_cycle": "monthly",
    "features": ["Unlimited AI prompts", "Premium predictions", "Advanced tracker", "Priority support", "Custom recommendations"],
    "is_default": false,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z"
  }
}
```

#### Delete Subscription Plan

```
DELETE /.netlify/functions/admin-subscriptions/plans?id=6
```

Deletes a subscription plan.

**Query Parameters:**

- `id`: Plan ID

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "message": "Subscription plan deleted successfully"
}
```

### AI Integration

#### Process Prompt

```
POST /.netlify/functions/prompt-process
```

Processes a user prompt and returns AI-generated recommendations.

**Request Body:**

```json
{
  "prompt": "Give me some NBA player prop bets for tonight"
}
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "response": "Based on tonight's NBA games, here are some player prop bets to consider:\n\n1. LeBron James Over 26.5 Points (-110)\n   The Lakers are facing the Kings who have struggled defensively against forwards this season.\n\n2. Nikola Jokić Over 11.5 Rebounds (-115)\n   Jokić has averaged 13.2 rebounds in his last 5 games and faces a Pistons team that ranks bottom 5 in rebounding.\n\n3. Stephen Curry Over 4.5 Three-Pointers Made (-125)\n   Curry has hit 5+ threes in 7 of his last 10 games and faces the Rockets who allow the most three-point attempts in the league.",
  "promptAnalysis": {
    "sport": "NBA",
    "betType": "prop",
    "timeFrame": "tonight",
    "teamsOrPlayers": null,
    "riskProfile": null,
    "filters": null
  },
  "promptLogId": 123,
  "remainingPrompts": 2
}
```

### Tracker

#### Save Pick

```
POST /.netlify/functions/tracker-save
```

Saves a pick to the tracker.

**Request Body:**

```json
{
  "playText": "LeBron James Over 26.5 Points",
  "promptLogId": 123,
  "reasoning": "The Lakers are facing the Kings who have struggled defensively against forwards this season.",
  "sport": "NBA",
  "betType": "prop",
  "metadata": {
    "player": "LeBron James",
    "team": "Lakers",
    "opponent": "Kings",
    "line": 26.5,
    "type": "points",
    "odds": -110
  }
}
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Pick saved successfully",
  "pick": {
    "id": 1,
    "play_text": "LeBron James Over 26.5 Points",
    "status": "pending",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### Get Saved Picks

```
GET /.netlify/functions/tracker-get
```

Gets saved picks with filtering and pagination.

**Query Parameters:**

- `status`: Filter by status (pending, hit, miss)
- `sport`: Filter by sport
- `limit`: Number of picks per page (default: 10)
- `offset`: Offset for pagination

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "picks": [
    {
      "id": 1,
      "play_text": "LeBron James Over 26.5 Points",
      "reasoning": "The Lakers are facing the Kings who have struggled defensively against forwards this season.",
      "status": "pending",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "sport": "NBA",
      "bet_type": "prop",
      "metadata": {
        "player": "LeBron James",
        "team": "Lakers",
        "opponent": "Kings",
        "line": 26.5,
        "type": "points",
        "odds": -110
      },
      "prompt_log_id": 123
    },
    ...
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

#### Update Pick Status

```
PUT /.netlify/functions/tracker-update
```

Updates the status of a saved pick.

**Request Body:**

```json
{
  "pickId": 1,
  "status": "hit"
}
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Pick status updated successfully",
  "pick": {
    "id": 1,
    "play_text": "LeBron James Over 26.5 Points",
    "status": "hit",
    "updated_at": "2023-01-02T00:00:00Z"
  }
}
```

### Analytics (Admin)

```
GET /.netlify/functions/admin-analytics
```

Gets analytics data for the admin dashboard.

**Query Parameters:**

- `period`: Time period (7d, 30d, 90d, 1y, default: 30d)

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "userStats": {
    "totalUsers": 1000,
    "newUsers": 50,
    "activeUsers": 300,
    "userGrowth": [
      { "date": "2023-01-01T00:00:00Z", "count": 5 },
      { "date": "2023-01-02T00:00:00Z", "count": 7 },
      ...
    ]
  },
  "subscriptionStats": {
    "subscriptionCounts": {
      "free": 700,
      "core": 200,
      "pro": 100
    }
  },
  "promptStats": {
    "totalPrompts": 5000,
    "promptsInPeriod": 1500,
    "promptsByDay": [
      { "date": "2023-01-01T00:00:00Z", "count": 50 },
      { "date": "2023-01-02T00:00:00Z", "count": 65 },
      ...
    ],
    "promptsBySport": {
      "NBA": 800,
      "NFL": 400,
      "MLB": 200,
      "NHL": 100
    },
    "promptsByBetType": {
      "prop": 600,
      "spread": 400,
      "moneyline": 300,
      "over/under": 200
    }
  },
  "trackerStats": {
    "totalPicks": 3000,
    "picksInPeriod": 1000,
    "picksByStatus": {
      "pending": 200,
      "hit": 500,
      "miss": 300
    },
    "picksBySport": {
      "NBA": 500,
      "NFL": 300,
      "MLB": 150,
      "NHL": 50
    },
    "picksByDay": [
      { "date": "2023-01-01T00:00:00Z", "count": 30 },
      { "date": "2023-01-02T00:00:00Z", "count": 35 },
      ...
    ]
  }
}
```
