require('dotenv').config();
// Netlify function to get user's subscription details
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { collapseTextChangeRangesAcrossMultipleVersions } = require('typescript');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid token');
  }
}

// Get user's subscription details
async function getUserSubscription(userId) {
  try {
    // Get user details
    const userResult = await pool.query(
      `SELECT id, email, name, subscription_plan, status, stripe_customer_id
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // If user doesn't have a subscription plan or it's free, return null
    if (!user.subscription_plan || user.subscription_plan === 'free') {
      return {
        statusCode: 200,
        body: JSON.stringify({ subscription: null }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

    // Get subscription plan details
    const planResult = await pool.query(
      `SELECT id, name, price, features
       FROM subscription_plans
       WHERE name = $1`,
      [user.subscription_plan]
    );
    
    if (planResult.rows.length === 0) {
      throw new Error('Subscription plan not found');
    }

    const plan = planResult.rows[0];
    const userSubscriptionResult = await pool.query(
      `SELECT id, end_date
       FROM user_subscriptions
       WHERE user_id = $1`,
      [user.id]
    );
      
    if (userSubscriptionResult.rows.length === 0) {
      throw new Error('Subscription plan not found');
    }

    const userSubscription = userSubscriptionResult.rows[0];

    // Get subscription from Stripe if customer ID exists
    let stripeSubscription = null;

    console.log('user.stripe_customer_id', user.stripe_customer_id);
    if (user.stripe_customer_id) {
      try {
        // Get customer's subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 1
        });

        console.log('subscriptions', subscriptions);

        if (subscriptions.data.length > 0) {
          stripeSubscription = subscriptions.data[0];
        }
      } catch (stripeError) {
        console.warn('Error fetching Stripe subscription:', stripeError.message);
        // Continue without Stripe data
      }
    }

    // Log subscription_end_date
    console.log('subscription_end_date from DB:', userSubscription.end_date);

    // Format the date for debugging
    let formattedDate = null;
    if (userSubscription.end_date) {
      try {
        formattedDate = new Date(userSubscription.end_date).toISOString();
        console.log('Formatted date:', formattedDate);
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    } else {
      // Default to 30 days from now if no end date
      formattedDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      console.log('Using default date:', formattedDate);
    }

    // Build subscription object
    const subscription = {
      id: stripeSubscription ? stripeSubscription.id : `local_${user.id}`,
      plan: plan.name.charAt(0).toUpperCase() + plan.name.slice(1), // Capitalize first letter
      planKey: plan.name,
      status: user.status || 'active',
      interval: 'monthly', // We only support monthly billing
      next_billing_date: userSubscription.end_date, // Add the next billing date directly from the database
      amount: plan.price,
      cancel_at_period_end: stripeSubscription ? stripeSubscription.cancel_at_period_end : false,
      features: typeof plan.features === 'string'
        ? Object.keys(JSON.parse(plan.features)).map(key => `${key}: ${JSON.parse(plan.features)[key]}`)
        : Object.keys(plan.features).map(key => `${key}: ${plan.features[key]}`)
    };

    console.log('Subscription object created:', JSON.stringify(subscription, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ subscription }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return {
      statusCode: error.message === 'User not found' ? 404 : 500,
      body: JSON.stringify({ error: error.message || 'Failed to get user subscription' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }
}

// Netlify function handler
exports.handler = async (event, context) => {
  // 🔧 Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://gameplanai.io',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }

  try {
    // Get authorization token
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

    const token = authHeader.split(' ')[1];

    // Verify token and get user ID
    const decoded = verifyToken(token);
    const userId = decoded.sub;

    // Get user's subscription
    return await getUserSubscription(userId);
  } catch (error) {
    console.error('Error in user-subscription function:', error);

    return {
      statusCode: error.message === 'Invalid token' ? 401 : 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }
};
