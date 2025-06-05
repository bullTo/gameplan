# GamePlan AI Admin Area

This document provides detailed information about the admin area of the GamePlan AI platform, including its features, components, and implementation details.

## Overview

The admin area is a separate section of the application that allows administrators to manage the platform. It is accessible at `/management` and requires admin authentication.

The admin area includes the following main sections:

1. **Dashboard**: Overview of key metrics and statistics
2. **User Management**: CRUD operations for user accounts
3. **Subscription Management**: Management of subscription plans and user subscriptions
4. **Analytics**: Detailed analytics on user activity and platform performance

## Authentication

Admin authentication is handled by the `admin-auth.js` Netlify function. Admins have a separate authentication flow from regular users, with their credentials stored in the `admins` table in the database.

### Admin Login

The admin login page is located at `/management/login` and allows administrators to log in with their email and password. Upon successful authentication, a JWT token is generated and stored in localStorage.

### Authentication Flow

1. Admin submits login credentials
2. Backend validates credentials against the `admins` table in the database
3. If valid, a JWT token with admin role is generated and returned to the client
4. The client stores the token in localStorage
5. The token is included in the Authorization header for subsequent API requests
6. The backend validates the token and admin role for each protected API endpoint

## Dashboard

The admin dashboard provides an overview of key metrics and statistics about the platform. It is implemented in the `Dashboard.jsx` component and uses data from the `admin-analytics.js` Netlify function.

### Key Metrics

- **Total Users**: Number of registered users
- **New Users**: Number of users registered in the selected time period
- **Active Users**: Number of users who logged in during the selected time period
- **Subscription Distribution**: Breakdown of users by subscription plan
- **Prompt Usage**: Number of prompts processed by the AI
- **Tracker Usage**: Number of picks saved to the tracker

### Charts and Visualizations

- **User Growth**: Chart showing new user registrations over time
- **Subscription Distribution**: Chart showing the distribution of subscription plans
- **Prompt Usage by Sport**: Chart showing the distribution of prompts by sport
- **Tracker Statistics**: Breakdown of pick statuses (pending, hit, miss)

## User Management

The user management section allows administrators to view, create, update, and delete user accounts. It is implemented in the `Users.jsx` component and uses data from the `admin-users.js` Netlify function.

### Features

- **User Listing**: View a list of all users with pagination and filtering
- **User Creation**: Create new user accounts
- **User Editing**: Update user details, including name, email, and subscription plan
- **User Deletion**: Delete user accounts

### Filters and Sorting

- **Search**: Search users by name or email
- **Subscription Filter**: Filter users by subscription plan
- **Sorting**: Sort users by various fields (created_at, last_login, name, email)

## Subscription Management

The subscription management section allows administrators to manage subscription plans and user subscriptions. It is implemented in the `Subscriptions.jsx` component and uses data from the `admin-subscriptions.js` Netlify function.

### Subscription Plans

The subscription plans tab allows administrators to:

- **View Plans**: See a list of all available subscription plans
- **Create Plans**: Create new subscription plans with custom features and pricing
- **Edit Plans**: Update existing subscription plans
- **Delete Plans**: Remove subscription plans that are no longer needed
- **Set Default Plan**: Designate a plan as the default for new users

### Plan Properties

- **Name**: Display name of the plan
- **Key**: Unique identifier for the plan (free, core, pro, etc.)
- **Price**: Cost of the plan
- **Billing Cycle**: Monthly or annual
- **Features**: List of features included in the plan
- **Default**: Whether this is the default plan for new users
- **Active**: Whether the plan is currently active

### User Subscriptions

The user subscriptions tab allows administrators to:

- **View Subscriptions**: See a list of all user subscriptions with pagination and filtering
- **Edit Subscriptions**: Update a user's subscription details
- **Filter Subscriptions**: Filter by plan, status, or search by user name/email

### Subscription Properties

- **User**: The user associated with the subscription
- **Plan**: The subscription plan
- **Billing Cycle**: Monthly or annual
- **Status**: Active, canceled, or expired
- **Start Date**: When the subscription began
- **End Date**: When the subscription will end (if applicable)
- **Amount**: The cost of the subscription

## Analytics

The analytics section provides detailed insights into user activity and platform performance. It is implemented in the `Analytics.jsx` component and uses data from the `admin-analytics.js` Netlify function.

### Time Periods

Administrators can view analytics for different time periods:

- **7 days**: Last week
- **30 days**: Last month
- **90 days**: Last quarter
- **1 year**: Last year

### User Analytics

- **User Growth**: New user registrations over time
- **Active Users**: Number of users who logged in during the selected period
- **User Retention**: Percentage of users who return after registration

### Prompt Analytics

- **Prompt Volume**: Number of prompts processed over time
- **Prompt Distribution by Sport**: Breakdown of prompts by sport
- **Prompt Distribution by Bet Type**: Breakdown of prompts by bet type
- **Most Active Users**: Users who have submitted the most prompts

### Tracker Analytics

- **Pick Volume**: Number of picks saved over time
- **Pick Success Rate**: Percentage of picks marked as hits
- **Pick Distribution by Sport**: Breakdown of picks by sport
- **Pick Distribution by Status**: Breakdown of picks by status (pending, hit, miss)

## Implementation Details

### Frontend Components

The admin area is implemented using the following main components:

- **AdminLayout.jsx**: Layout component for the admin area
- **Login.jsx**: Admin login page
- **Dashboard.jsx**: Admin dashboard page
- **Users.jsx**: User management page
- **Subscriptions.jsx**: Subscription management page
- **Analytics.jsx**: Analytics page

### Backend Functions

The admin area is supported by the following Netlify functions:

- **admin-auth.js**: Admin authentication
- **admin-users.js**: User management
- **admin-subscriptions.js**: Subscription management
- **admin-analytics.js**: Analytics data

### Database Tables

The admin area uses the following database tables:

- **admins**: Admin user accounts
- **users**: Regular user accounts
- **subscription_plans**: Available subscription plans
- **user_subscriptions**: User subscription information
- **prompt_logs**: Logs of user prompts to the AI
- **saved_picks**: User's saved betting picks

## Security Considerations

The admin area implements several security measures to protect sensitive operations:

1. **Role-Based Access Control**: Only users with the admin role can access the admin area
2. **JWT Authentication**: Secure token-based authentication
3. **Protected API Endpoints**: All admin API endpoints verify admin role
4. **Input Validation**: Validation of all user inputs
5. **Error Handling**: Proper error handling without exposing sensitive information

## Adding a New Admin

To add a new admin user, you can use the following methods:

### Method 1: Using Environment Variables

1. Add the admin email and password to the `.env` file:
   ```
   ADMIN_EMAIL=admin@gameplanai.io
   ADMIN_PASSWORD=securepassword
   ```
2. Restart the application
3. The admin user will be created automatically if it doesn't exist

### Method 2: Using the Database

1. Generate a password hash using bcrypt
2. Insert a new record into the `admins` table:
   ```sql
   INSERT INTO admins (name, email, password_hash)
   VALUES ('Admin Name', 'admin@example.com', 'hashed_password');
   ```

## Customizing the Admin Area

### Adding a New Section

To add a new section to the admin area:

1. Create a new page component in `src/pages/management/`
2. Add a new route in `src/layouts/ManagementLayout.tsx`
3. Add a new navigation link in `src/layouts/AdminLayout.jsx`
4. Create any necessary backend functions in `netlify/functions/`

### Modifying Existing Sections

To modify an existing section:

1. Update the corresponding page component in `src/pages/management/`
2. Update any related backend functions in `netlify/functions/`
3. Update the database schema if necessary

## Best Practices

When working with the admin area, follow these best practices:

1. **Always Validate Input**: Validate all user inputs on both the client and server
2. **Use Proper Error Handling**: Handle errors gracefully and provide meaningful error messages
3. **Implement Pagination**: Use pagination for large datasets to improve performance
4. **Cache API Responses**: Cache responses where appropriate to reduce database load
5. **Use Transactions**: Use database transactions for operations that modify multiple records
6. **Log Admin Actions**: Log important admin actions for audit purposes
7. **Test Thoroughly**: Test all admin functionality thoroughly before deployment
