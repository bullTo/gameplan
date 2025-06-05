# GamePlan AI Documentation

Welcome to the GamePlan AI documentation. This documentation provides comprehensive information about the GamePlan AI platform, including its architecture, setup process, API endpoints, and key components.

## Documentation Index

### Getting Started
- [README](README.md) - Project overview and introduction
- [Setup Guide](setup-guide.md) - How to set up the development environment

### Architecture and Design
- [Architecture](architecture.md) - System architecture and component overview
- [API Documentation](api-documentation.md) - API endpoints and usage
- [Admin Area](admin-area.md) - Admin portal features and implementation

## Project Overview

GamePlan AI is a sports betting assistant powered by artificial intelligence. The platform provides users with:

- AI-powered betting recommendations
- Customized predictions based on user preferences
- Tracking of betting performance
- Real-time sports data integration

The application has two main areas:
- **Customer Portal** (`/account/*`): Where users can access predictions, track their bets, and interact with the AI
- **Admin Portal** (`/management/*`): Where administrators can manage users, subscription plans, and view analytics

## Technology Stack

GamePlan AI uses the following technology stack:

- **Frontend**: React + Vite with Tailwind CSS and shadcn/ui components
- **Backend**: Netlify Functions (serverless)
- **Database**: PostgreSQL (Neon DB)
- **Authentication**: JWT-based authentication
- **API Integrations**: GoalServe API for sports data, OpenAI for AI predictions

## Key Features

### Customer Portal

- **Dashboard**: Overview of stats, recommendations, and recent activity
- **Predictions**: AI-powered betting recommendations
- **Tracker**: Tracking of betting performance
- **Profile**: User profile and account settings

### Admin Portal

- **Dashboard**: Overview of key metrics and statistics
- **User Management**: CRUD operations for user accounts
- **Subscription Management**: Management of subscription plans and user subscriptions
- **Analytics**: Detailed analytics on user activity and platform performance

## Getting Started

To get started with GamePlan AI development, follow these steps:

1. Read the [README](README.md) to understand the project
2. Follow the [Setup Guide](setup-guide.md) to set up your development environment
3. Explore the [Architecture](architecture.md) to understand the system design
4. Review the [API Documentation](api-documentation.md) to understand the available endpoints
5. Check out the [Admin Area](admin-area.md) documentation if you'll be working on admin features

## Contributing

When contributing to the GamePlan AI project, please follow these guidelines:

1. **Code Style**: Follow the existing code style and formatting
2. **Documentation**: Update documentation when making significant changes
3. **Testing**: Write tests for new features and ensure existing tests pass
4. **Pull Requests**: Create pull requests with clear descriptions of changes
5. **Commits**: Write clear commit messages that explain the purpose of changes

## Support

If you need help with the GamePlan AI project, you can:

1. Check the documentation in this directory
2. Contact the project maintainers
3. Open an issue on the project repository

## License

GamePlan AI is proprietary software. All rights reserved.
