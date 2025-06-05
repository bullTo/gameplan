# AI Review of GamePlan AI Application

## Application Overview

Based on the documentation, GamePlan AI is a sports betting assistant platform that helps users generate betting suggestions through natural language prompts. The application does not facilitate actual betting but provides data-driven recommendations for informational purposes only.

### Core Functionality

1. **Prompt-Based Betting Suggestions**
   - Users enter natural language prompts about betting scenarios
   - AI interprets these prompts to understand user intent
   - System generates structured betting suggestions based on sports data
   - Suggestions include reasoning and supporting evidence

2. **User Authentication & Subscription Tiers**
   - Free tier: 3 prompts/day
   - Core tier ($49/month): 15 prompts/day, full tracker access
   - Pro tier ($99/month): 30 prompts/day, full tracker, advanced props & parlays

3. **Play Tracker**
   - Users can save betting suggestions to their personal tracker
   - Track the status of suggestions (Pending, Hit, Miss)
   - Review historical suggestions and their outcomes

4. **Data Integration**
   - Integration with GoalServe API for sports data
   - OpenAI GPT-4 for natural language processing and suggestion generation

## Recommended Database Structure (Neon DB)

Based on the requirements, I recommend the following PostgreSQL database structure for Neon DB:

### Tables

#### 1. `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'free', -- 'free', 'core', 'pro'
  subscription_status VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  daily_prompt_count INTEGER DEFAULT 0,
  prompt_count_reset_date DATE DEFAULT CURRENT_DATE
);
```

#### 2. `admins`
```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'super_admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);
```

#### 3. `prompt_logs`
```sql
CREATE TABLE prompt_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sport VARCHAR(50),
  bet_type VARCHAR(50),
  parsed_entities JSONB -- Store extracted entities from prompt
);
```

#### 4. `saved_picks`
```sql
CREATE TABLE saved_picks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prompt_log_id INTEGER REFERENCES prompt_logs(id) ON DELETE SET NULL,
  play_text TEXT NOT NULL,
  reasoning TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'hit', 'miss'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sport VARCHAR(50),
  bet_type VARCHAR(50),
  metadata JSONB -- Additional data about the pick
);
```

#### 5. `subscription_plans`
```sql
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'core', 'pro'
  price_monthly INTEGER NOT NULL, -- in cents
  daily_prompt_limit INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. `user_subscription_history`
```sql
CREATE TABLE user_subscription_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id) ON DELETE SET NULL,
  stripe_subscription_id VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'expired'
  payment_status VARCHAR(50), -- 'paid', 'failed', 'refunded'
  amount_paid INTEGER, -- in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
-- Optimize user lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_plan, subscription_status);

-- Optimize prompt logs queries
CREATE INDEX idx_prompt_logs_user_id ON prompt_logs(user_id);
CREATE INDEX idx_prompt_logs_created_at ON prompt_logs(created_at);
CREATE INDEX idx_prompt_logs_sport ON prompt_logs(sport);

-- Optimize saved picks queries
CREATE INDEX idx_saved_picks_user_id ON saved_picks(user_id);
CREATE INDEX idx_saved_picks_status ON saved_picks(status);
CREATE INDEX idx_saved_picks_created_at ON saved_picks(created_at);
```

### Initial Data

```sql
-- Insert subscription plans
INSERT INTO subscription_plans (name, price_monthly, daily_prompt_limit, features)
VALUES 
  
  ('pro', 4900, 15, '{"tracker": true, "advanced_props": false}'),
  ('elite', 9900, 30, '{"tracker": true, "advanced_props": true}');

-- Create initial admin user (password should be hashed in production)
INSERT INTO admins (email, password_hash, name, role)
VALUES ('allan@webjungle.co.uk', 'hashed_password_here', 'Admin User', 'super_admin');
```

## Netlify Functions Implementation

For the serverless backend using Netlify Functions, I recommend the following structure:

### Authentication Functions
- `auth.js`: Handle user registration (DONE)
- `auth.js`: Handle user login (DONE)
- `auth-reset-password.js`: Handle password reset (DONE)

### User Management Functions
- `user-get.js`: Get user profile
- `user-update.js`: Update user profile
- `user-subscription.js`: Get subscription details
- `user-usage.js`: Get prompt usage statistics

### Prompt Functions
- `prompt-process.js`: Process user prompts
  - Parse the prompt using GPT-4
  - Fetch relevant data from GoalServe API
  - Generate and return betting suggestions

### Tracker Functions
- `tracker-save.js`: Save a suggestion to user's tracker
- `tracker-get.js`: Get user's saved suggestions
- `tracker-update.js`: Update status of a saved suggestion
- `tracker-delete.js`: Delete a saved suggestion

### Admin Functions
- `admin-login.js`: Handle admin login
- `admin-users.js`: Get/manage users
- `admin-stats.js`: Get platform statistics
- `admin-subscriptions.js`: Manage subscription plans

### Subscription Functions
- `stripe-create-checkout.js`: Create Stripe checkout session
- `stripe-webhook.js`: Handle Stripe webhook events
- `subscription-change.js`: Change subscription plan

## Implementation Considerations

1. **Database Interactions**
   - Use Neon DB's serverless PostgreSQL for all data storage
   - Implement connection pooling for efficient database access
   - Use prepared statements to prevent SQL injection

2. **Authentication & Security**
   - Implement JWT-based authentication
   - Store hashed passwords only (using bcrypt)
   - Set appropriate CORS policies
   - Implement rate limiting on API endpoints

3. **Subscription Management**
   - Use Stripe for subscription billing
   - Implement webhook handlers for subscription events
   - Daily reset of prompt counts at midnight UTC

4. **API Integration**
   - Cache GoalServe API responses to reduce API calls
   - Implement error handling for API failures
   - Use streaming responses for OpenAI API when possible

5. **Performance Optimization**
   - Implement database query optimization
   - Use edge caching for static content
   - Optimize API response sizes

This database structure and function architecture should provide a solid foundation for the GamePlan AI application while allowing for future scalability and feature expansion.
