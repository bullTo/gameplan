require('dotenv').config();

// Netlify function to create a Stripe checkout session for subscription purchases
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');

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

// Get user by ID
async function getUserById(userId) {
  const result = await pool.query(
    'SELECT id, email, name, stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
}

// Get subscription plan by name
async function getSubscriptionPlan(planName) {
  const result = await pool.query(
    'SELECT id, name, price, features FROM subscription_plans WHERE name = $1',
    [planName]
  );

  if (result.rows.length === 0) {
    throw new Error(`Subscription plan not found: ${planName}`);
  }

  return result.rows[0];
}

// Create or retrieve Stripe customer
async function getOrCreateStripeCustomer(user) {
  if (user.stripe_customer_id) {
    // Retrieve existing customer
    try {
      const customer = await stripe.customers.retrieve(user.stripe_customer_id);
      if (!customer.deleted) {
        return customer;
      }
    } catch (error) {
      console.warn(`Error retrieving Stripe customer: ${error.message}`);
      // Continue to create a new customer if retrieval fails
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id
    }
  });

  // Update user with new Stripe customer ID
  await pool.query(
    'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
    [customer.id, user.id]
  );

  return customer;
}

// Create a Stripe checkout session
async function createCheckoutSession(user, plan, successUrl, cancelUrl) {
  // Get or create Stripe customer
  const customer = await getOrCreateStripeCustomer(user);

  // Determine price ID based on plan name
  // Note: We're only supporting monthly subscriptions
  let priceId;
  if (plan.name === 'core') {
    priceId = process.env.STRIPE_PRICE_CORE;
  }
   else if (plan.name === 'pro') {
    priceId = process.env.STRIPE_PRICE_PRO;
  } else {
    throw new Error(`Invalid plan name: ${plan.name}`);
  }

  if (!priceId) {
    throw new Error(`Price ID not found for plan: ${plan.name}`);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,      },
    ],
    mode: 'subscription',
    subscription_data: {
      metadata: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name
      }
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true, 
    client_reference_id: user.id.toString(),
    metadata: {
      userId: user.id,
      planId: plan.id,
      planName: plan.name
    }
  });

  return session;
}

// Netlify function handler
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
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
    // Parse request body
    const { planName, successUrl, cancelUrl } = JSON.parse(event.body);

    // Validate required fields
    if (!planName || !successUrl || !cancelUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: planName, successUrl, cancelUrl'
        }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

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

    // Get user
    const user = await getUserById(userId);

    // Get subscription plan
    const plan = await getSubscriptionPlan(planName);

    // Create checkout session
    const session = await createCheckoutSession(user, plan, successUrl, cancelUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }
};
