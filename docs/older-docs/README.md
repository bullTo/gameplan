# GamePlan AI Documentation

Welcome to the GamePlan AI documentation. This guide will help you understand the project structure, setup process, and key components of the GamePlan AI platform.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [Database](#database)
7. [API Integration](#api-integration)
8. [Admin Area](#admin-area)
9. [Deployment](#deployment)
10. [Environment Variables](#environment-variables)

## Project Overview

GamePlan AI is a sports betting assistant powered by artificial intelligence. The platform provides users with:

- AI-powered betting recommendations
- Customized predictions based on user preferences
- Tracking of betting performance
- Real-time sports data integration

The application has two main areas:
- **Customer Portal** (`/account/*`): Where users can access predictions, track their bets, and interact with the AI
- **Admin Portal** (`/management/*`): Where administrators can manage users, subscription plans, and view analytics

## Getting Started

To set up the development environment, follow these steps:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see [Environment Variables](#environment-variables))
4. Start the development server:
   ```
   npm run dev
   ```
5. Start the Netlify Functions development server:
   ```
   npx netlify dev
   ```

## Architecture

GamePlan AI uses the following technology stack:

- **Frontend**: React + Vite with Tailwind CSS and shadcn/ui components
- **Backend**: Netlify Functions (serverless)
- **Database**: PostgreSQL (Neon DB)
- **Authentication**: JWT-based authentication
- **API Integrations**: GoalServe API for sports data, OpenAI for AI predictions

The application follows a client-server architecture where:
- The frontend is a single-page application (SPA) built with React
- The backend consists of serverless functions deployed on Netlify
- The database is hosted on Neon DB (PostgreSQL)

## Frontend

The frontend is built with React and Vite, using Tailwind CSS for styling and shadcn/ui for UI components. The main directories are:

- `src/components`: Reusable UI components
- `src/layouts`: Layout components for different sections of the app
- `src/pages`: Page components for different routes
- `src/api`: API client functions for interacting with the backend
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and helpers
- `src/styles`: Global styles and Tailwind configuration

### Key Frontend Features

- **Authentication**: Login, registration, and password reset functionality
- **Dashboard**: User dashboard with stats and recommendations
- **Predictions**: AI-powered betting recommendations
- **Tracker**: Tracking of betting performance
- **Admin Area**: Admin dashboard, user management, and subscription management

## Backend

The backend is built with Netlify Functions, which are serverless functions that run on AWS Lambda. The main directories are:

- `netlify/functions`: Serverless functions for different API endpoints

### Key Backend Features

- **Authentication**: User authentication and authorization
- **User Management**: CRUD operations for user accounts
- **Subscription Management**: Management of subscription plans and user subscriptions
- **AI Integration**: Integration with OpenAI for generating predictions
- **Sports Data Integration**: Integration with GoalServe API for sports data

## Database

The database is hosted on Neon DB, which is a PostgreSQL database service. The main tables are:

- `users`: User accounts
- `admins`: Admin accounts
- `subscription_plans`: Available subscription plans
- `user_subscriptions`: User subscription information
- `prompt_logs`: Logs of user prompts to the AI
- `saved_picks`: User's saved betting picks
- `api_cache`: Cache for API responses

## API Integration

GamePlan AI integrates with the following external APIs:

- **GoalServe API**: For sports data, including scores, schedules, and statistics
- **OpenAI API**: For generating AI-powered betting recommendations

### GoalServe Integration

The GoalServe API is used to fetch sports data, which is then processed and used to generate betting recommendations. The integration is handled by the `goalserve.js` Netlify function.

### OpenAI Integration

The OpenAI API is used to generate betting recommendations based on the sports data and user preferences. The integration is handled by the `openai.js` and `prompt-process.js` Netlify functions.

## Admin Area

The admin area is a separate section of the application that allows administrators to manage the platform. The main features are:

- **Dashboard**: Overview of key metrics and statistics
- **User Management**: CRUD operations for user accounts
- **Subscription Management**: Management of subscription plans and user subscriptions
- **Analytics**: Detailed analytics on user activity and platform performance

## Deployment

The application is deployed on Netlify, with the database hosted on Neon DB. The deployment process is as follows:

1. Push changes to the main branch
2. Netlify automatically builds and deploys the application
3. Netlify Functions are deployed as serverless functions on AWS Lambda

## Environment Variables

The application uses the following environment variables:

```
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require

# API Keys
OPENAI_API_KEY=your_openai_api_key
GOALSERVE_API_KEY=your_goalserve_api_key
RESEND_API_KEY=your_resend_api_key

# Application Configuration
VITE_APP_DOMAIN=app.gameplanai.io
VITE_APP_NAME=GamePlan AI
VITE_APP_DESCRIPTION=Sports betting assistant powered by AI
VITE_USE_REAL_API=true

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
COOKIE_SECRET=your_cookie_secret_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Subscription Plans (in cents)
PLAN_CORE_MONTHLY=4900
PLAN_CORE_ANNUALLY=49000
PLAN_PRO_MONTHLY=9900
PLAN_PRO_ANNUALLY=99000

# Prompt Limits
FREE_TIER_DAILY_LIMIT=3
CORE_TIER_DAILY_LIMIT=15
PRO_TIER_DAILY_LIMIT=30

# Admin Configuration
ADMIN_EMAIL=admin@gameplanai.io
ADMIN_PASSWORD=your_admin_password

# Figma Integration
FIGMA_TOKEN=your_figma_token
FIGMA_FILE_ID=your_figma_file_id
MCP_PORT=2999

# Builder.io
VITE_PUBLIC_BUILDER_KEY=your_builder_key
```

For more detailed information on each component, please refer to the specific documentation files in this directory.
