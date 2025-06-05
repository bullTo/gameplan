# GamePlan AI Setup Guide

This guide will walk you through the process of setting up the GamePlan AI development environment on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or later)
- **npm** (v8 or later)
- **Git**
- **Visual Studio Code** (recommended)
- **Netlify CLI** (for local development with Netlify Functions)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-organization/gameplan-ai.git
cd gameplan-ai
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Environment Variables

1. Create a `.env` file in the root directory of the project
2. Copy the contents from `.env.example` to your `.env` file
3. Update the values with your own credentials

Here's an example of what your `.env` file should look like:

```
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/gameplan

# API Keys
OPENAI_API_KEY=your_openai_api_key
GOALSERVE_API_KEY=your_goalserve_api_key

# Application Configuration
VITE_APP_DOMAIN=localhost:8888
VITE_APP_NAME=GamePlan AI
VITE_APP_DESCRIPTION=Sports betting assistant powered by AI
VITE_USE_REAL_API=true

# Authentication
JWT_SECRET=development_jwt_secret_key
JWT_EXPIRY=7d

# Admin Configuration
ADMIN_EMAIL=admin@gameplanai.io
ADMIN_PASSWORD=Admin123!
```

## Step 4: Set Up the Database

### Option 1: Use a Local PostgreSQL Database

1. Install PostgreSQL on your machine
2. Create a new database called `gameplan`
3. Update the `DATABASE_URL` in your `.env` file to point to your local database

### Option 2: Use Neon DB (Recommended)

1. Sign up for a free account at [Neon DB](https://neon.tech/)
2. Create a new project and database
3. Copy the connection string and update the `DATABASE_URL` in your `.env` file

## Step 5: Start the Development Server

Run the following command to start the Vite development server:

```bash
npm run dev
```

This will start the frontend development server at `http://localhost:5173`.

## Step 6: Start the Netlify Functions Development Server

In a separate terminal, run the following command to start the Netlify Functions development server:

```bash
npx netlify dev
```

This will start the Netlify development server at `http://localhost:8888`, which will proxy requests to the Vite development server and handle Netlify Functions.

## Step 7: Access the Application

Open your browser and navigate to:

- **Customer Portal**: `http://localhost:8888/account`
- **Admin Portal**: `http://localhost:8888/management`

## Step 8: Set Up Admin Account

The first time you run the application, an admin account will be created automatically using the credentials specified in your `.env` file (`ADMIN_EMAIL` and `ADMIN_PASSWORD`).

You can log in to the admin portal using these credentials.

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database, check the following:

1. Make sure your `DATABASE_URL` is correct
2. Ensure that PostgreSQL is running
3. Check that your database user has the necessary permissions

### Netlify Functions Issues

If you're having trouble with Netlify Functions, try the following:

1. Make sure you have the latest version of the Netlify CLI installed
2. Check that your `.env` file is in the root directory of the project
3. Try running `npx netlify functions:build` to build the functions manually

### API Integration Issues

If you're having trouble with the GoalServe or OpenAI integrations, check the following:

1. Make sure your API keys are correct in your `.env` file
2. Check that you have sufficient credits/quota for the APIs
3. Look at the server logs for any error messages

## Development Workflow

### Frontend Development

1. Make changes to the React components in the `src` directory
2. The Vite development server will automatically reload when you save changes

### Backend Development

1. Make changes to the Netlify Functions in the `netlify/functions` directory
2. The Netlify development server will automatically reload when you save changes

### Database Schema Changes

If you need to make changes to the database schema:

1. Update the table creation queries in the relevant Netlify Functions
2. The tables will be created automatically if they don't exist when the functions are called

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- **Frontend Tests**: Write tests in the `src/__tests__` directory using Jest and React Testing Library
- **Backend Tests**: Write tests in the `netlify/functions/__tests__` directory using Jest

## Building for Production

```bash
npm run build
```

This will create a production build in the `dist` directory.

## Deploying to Netlify

The easiest way to deploy the application is to connect your GitHub repository to Netlify:

1. Push your changes to GitHub
2. Log in to Netlify and create a new site from Git
3. Select your repository and configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Configure your environment variables in the Netlify dashboard
5. Deploy the site

Alternatively, you can deploy manually using the Netlify CLI:

```bash
npx netlify deploy --prod
```

## Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)
- [GoalServe API Documentation](https://www.goalserve.com/en/sports-data-feeds/api-documentation)
