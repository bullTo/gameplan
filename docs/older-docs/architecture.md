# GamePlan AI Architecture

This document provides an overview of the GamePlan AI architecture, including the frontend, backend, database, and external integrations.

## System Architecture

GamePlan AI follows a modern web application architecture with the following components:

1. **Frontend**: React + Vite single-page application (SPA)
2. **Backend**: Serverless functions deployed on Netlify
3. **Database**: PostgreSQL database hosted on Neon DB
4. **External APIs**: GoalServe API for sports data, OpenAI API for AI predictions

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│ Netlify Functions│────▶│  PostgreSQL DB  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │  ▲
                               │  │
                               ▼  │
                        ┌─────────────────┐
                        │                 │
                        │  External APIs  │
                        │                 │
                        └─────────────────┘
                               │  ▲
                               │  │
                               ▼  │
                        ┌─────────────────┐
                        │                 │
                        │   GoalServe     │
                        │   OpenAI        │
                        │                 │
                        └─────────────────┘
```

## Frontend Architecture

The frontend is built with React and Vite, using Tailwind CSS for styling and shadcn/ui for UI components. It follows a component-based architecture with the following structure:

### Directory Structure

```
src/
├── api/            # API client functions
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── layouts/        # Layout components
├── lib/            # Utility functions
├── pages/          # Page components
│   ├── account/    # Customer portal pages
│   ├── management/ # Admin portal pages
│   └── ...
├── styles/         # Global styles
├── App.tsx         # Main application component
├── main.tsx        # Entry point
└── ...
```

### Key Components

- **App.tsx**: The main application component that sets up routing
- **AccountLayout.tsx**: Layout for the customer portal
- **AdminLayout.jsx**: Layout for the admin portal
- **Dashboard.tsx**: Customer dashboard page
- **AdminDashboard.jsx**: Admin dashboard page
- **PromptInput.tsx**: Component for entering prompts to the AI
- **SavedPicks.tsx**: Component for displaying saved picks

### Routing

The application uses React Router for client-side routing with the following main routes:

- `/`: Landing page
- `/account`: Customer portal
  - `/account/dashboard`: Customer dashboard
  - `/account/predictions`: Predictions page
  - `/account/tracker`: Tracker page
  - `/account/profile`: User profile page
- `/management`: Admin portal
  - `/management/dashboard`: Admin dashboard
  - `/management/users`: User management
  - `/management/analytics`: Analytics dashboard
  - `/management/subscriptions`: Subscription management

## Backend Architecture

The backend is built with Netlify Functions, which are serverless functions that run on AWS Lambda. Each function handles a specific set of related API endpoints.

### Netlify Functions

```
netlify/functions/
├── auth.js                # Authentication (login, register, reset password)
├── admin-auth.js          # Admin authentication
├── admin-users.js         # User management for admins
├── admin-analytics.js     # Analytics data for admins
├── admin-subscriptions.js # Subscription management for admins
├── goalserve.js           # GoalServe API integration
├── openai.js              # OpenAI API integration
├── prompt-process.js      # Process user prompts with AI
├── tracker-save.js        # Save picks to tracker
├── tracker-get.js         # Get saved picks
└── tracker-update.js      # Update pick status
```

### Authentication Flow

1. User submits login credentials
2. Backend validates credentials against the database
3. If valid, a JWT token is generated and returned to the client
4. The client stores the token in localStorage
5. The token is included in the Authorization header for subsequent API requests
6. The backend validates the token for each protected API endpoint

## Database Architecture

The database is a PostgreSQL database hosted on Neon DB with the following main tables:

### Tables

- **users**: User accounts
  - id (PK)
  - name
  - email
  - password_hash
  - subscription_plan
  - daily_prompt_count
  - prompt_count_reset_date
  - created_at
  - last_login

- **admins**: Admin accounts
  - id (PK)
  - name
  - email
  - password_hash
  - created_at
  - last_login

- **subscription_plans**: Available subscription plans
  - id (PK)
  - name
  - key
  - price
  - billing_cycle
  - features (JSONB)
  - is_default
  - is_active
  - created_at
  - updated_at

- **user_subscriptions**: User subscription information
  - id (PK)
  - user_id (FK to users.id)
  - plan_id (FK to subscription_plans.id)
  - status
  - start_date
  - end_date
  - amount
  - created_at
  - updated_at

- **prompt_logs**: Logs of user prompts to the AI
  - id (PK)
  - user_id (FK to users.id)
  - prompt_text
  - response
  - created_at
  - sport
  - bet_type
  - parsed_entities (JSONB)

- **saved_picks**: User's saved betting picks
  - id (PK)
  - user_id (FK to users.id)
  - prompt_log_id (FK to prompt_logs.id)
  - play_text
  - reasoning
  - status
  - created_at
  - updated_at
  - sport
  - bet_type
  - metadata (JSONB)

- **api_cache**: Cache for API responses
  - cache_key (PK)
  - data (JSONB)
  - created_at

### Entity Relationship Diagram (ERD)

```
users 1──┐
         │
         │ N
         ▼
  prompt_logs 1──┐
                 │
                 │ N
                 ▼
            saved_picks

users 1──┐
         │
         │ N
         ▼
  user_subscriptions N──1 subscription_plans
```

## External Integrations

### GoalServe API

The GoalServe API is used to fetch sports data, including:

- Scores
- Schedules
- Standings
- Team and player statistics

The integration is handled by the `goalserve.js` Netlify function, which:

1. Fetches data from the GoalServe API
2. Caches the responses in the database
3. Transforms the XML responses to JSON
4. Returns the data to the client

### OpenAI API

The OpenAI API is used to generate betting recommendations based on:

- Sports data from GoalServe
- User preferences
- Historical performance

The integration is handled by the `openai.js` and `prompt-process.js` Netlify functions, which:

1. Process user prompts
2. Fetch relevant sports data
3. Generate prompts for OpenAI
4. Process and return the AI responses

## Subscription System

The subscription system allows users to access different features based on their subscription plan:

### Subscription Plans

- **Free**: Basic access with limited features
  - 3 AI prompts per day
  - Basic predictions
  - No tracker access

- **Core**: Standard access with more features
  - 15 AI prompts per day
  - Advanced predictions
  - Tracker access
  - Email support

- **Pro**: Premium access with all features
  - 30 AI prompts per day
  - Premium predictions
  - Advanced tracker
  - Priority support
  - Custom recommendations

### Subscription Management

Administrators can manage subscription plans through the admin portal:

1. Create, update, and delete subscription plans
2. View and manage user subscriptions
3. Change a user's subscription plan
4. View subscription analytics

## Deployment Architecture

The application is deployed on Netlify with the following configuration:

- **Frontend**: Static files served from Netlify's CDN
- **Backend**: Netlify Functions deployed as AWS Lambda functions
- **Database**: PostgreSQL database hosted on Neon DB

### Deployment Flow

1. Code is pushed to the main branch on GitHub
2. Netlify automatically builds the application:
   - Frontend is built with `npm run build`
   - Netlify Functions are built with `netlify functions:build`
3. The built files are deployed to Netlify's CDN
4. Netlify Functions are deployed as AWS Lambda functions

## Security Considerations

- **Authentication**: JWT-based authentication with secure token handling
- **Authorization**: Role-based access control for different user types
- **Data Protection**: HTTPS for all communications
- **Database Security**: Secure connection with SSL
- **API Security**: API keys stored securely as environment variables
- **Input Validation**: Validation of all user inputs
- **Error Handling**: Proper error handling without exposing sensitive information

## Performance Considerations

- **Caching**: API responses are cached in the database
- **Code Splitting**: React code splitting for better load times
- **Lazy Loading**: Components and routes are lazy loaded
- **CDN**: Static assets are served from Netlify's CDN
- **Database Indexes**: Proper indexes for frequently queried columns
- **Connection Pooling**: Database connection pooling for better performance
