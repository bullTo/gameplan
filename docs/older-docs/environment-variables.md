# Environment Variables

This document describes the environment variables used in the GamePlan AI application.

## Database Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string for Neon DB | `postgresql://user:password@host/database?sslmode=require` |

## API Keys

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 integration | `sk_1234567890abcdefghijklmnopqrstuvwxyz1234567890` |
| `GOALSERVE_API_KEY` | GoalServe API key for sports data | `fd05c9e7e41044acb6b108dd7af3fbb6` |
| `RESEND_API_KEY` | Resend API key for email functionality | `re_1234567890abcdefghijklmnopqrstuvwxyz` |

## Application Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_DOMAIN` | Domain name for the application | `app.gameplanai.io` |
| `VITE_APP_NAME` | Name of the application | `GamePlan AI` |
| `VITE_APP_DESCRIPTION` | Brief description of the application | `Sports betting assistant powered by AI` |

## Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token generation | `your_jwt_secret_key_at_least_32_characters_long` |
| `JWT_EXPIRY` | Expiration time for JWT tokens | `7d` |
| `COOKIE_SECRET` | Secret key for cookie-based session management | `your_cookie_secret_key_for_session_management` |

## Stripe Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_1234567890abcdefghijklmnopqrstuvwxyz` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for frontend | `pk_test_1234567890abcdefghijklmnopqrstuvwxyz` |
| `STRIPE_WEBHOOK_SECRET` | Secret for verifying Stripe webhook events | `whsec_1234567890abcdefghijklmnopqrstuvwxyz` |

## Subscription Plans

| Variable | Description | Example |
|----------|-------------|---------|
| `PLAN_CORE_MONTHLY` | Price for Core plan monthly subscription (in cents) | `4900` |
| `PLAN_CORE_ANNUALLY` | Price for Core plan annual subscription (in cents) | `49000` |
| `PLAN_PRO_MONTHLY` | Price for Pro plan monthly subscription (in cents) | `9900` |
| `PLAN_PRO_ANNUALLY` | Price for Pro plan annual subscription (in cents) | `99000` |

## Prompt Limits

| Variable | Description | Example |
|----------|-------------|---------|
| `FREE_TIER_DAILY_LIMIT` | Daily prompt limit for free tier | `3` |
| `CORE_TIER_DAILY_LIMIT` | Daily prompt limit for Core tier | `15` |
| `PRO_TIER_DAILY_LIMIT` | Daily prompt limit for Pro tier | `30` |

## Admin Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Default admin email address | `admin@gameplanai.io` |

## Usage in Different Environments

### Development

In development, these variables are loaded from the `.env` file at the root of the project.

### Production

In production (Netlify), these variables should be set in the Netlify dashboard under "Site settings" > "Environment variables".

### Netlify Functions

When using Netlify Functions, environment variables are automatically available to the functions without any additional configuration.

Example usage in a Netlify Function:

```javascript
exports.handler = async function(event, context) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  
  // Use the environment variables in your function
  // ...
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success" })
  };
};
```
