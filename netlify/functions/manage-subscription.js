require('dotenv').config();

// Netlify function to manage user subscriptions (cancel, update, etc.)
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

// Get user's active subscription
async function getUserActiveSubscription(userId) {
  // First, check if user has a Stripe customer ID
  const userResult = await pool.query(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );
  
  if (userResult.rows.length === 0 || !userResult.rows[0].stripe_customer_id) {
    return null;
  }
  
  const stripeCustomerId = userResult.rows[0].stripe_customer_id;
  
  // Get the user's active subscription from the database
  const subscriptionResult = await pool.query(
    `SELECT id 
     FROM user_subscriptions
     WHERE user_id = $1 AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  
  if (subscriptionResult.rows.length === 0 || !subscriptionResult.rows[0].id) {
    return null;
  }
  
  const stripeSubscriptionId = stripeCustomerId;
  
  // Get the subscription details from Stripe
  try {
    return await stripe.subscriptions.retrieve(stripeSubscriptionId);
  } catch (error) {
    console.error(`Error retrieving Stripe subscription: ${error.message}`);
    return null;
  }
}

// Cancel a subscription
async function cancelSubscription(subscription) {
  return await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true
  });
}

// Reactivate a subscription that was set to cancel at period end
async function reactivateSubscription(subscription) {
  return await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: false
  });
}

// Update subscription to a new plan
async function updateSubscription(subscription, newPriceId) {
  return await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: false,
    proration_behavior: 'create_prorations',
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });
}

// Create a customer portal session
async function createCustomerPortalSession(stripeCustomerId, returnUrl) {
  return await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
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
    const { action, priceId, returnUrl } = JSON.parse(event.body);
    
    // Validate action
    if (!action || !['cancel', 'reactivate', 'update', 'portal'].includes(action)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid action. Must be one of: cancel, reactivate, update, portal' }),
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
    
    // For portal action, we just need the customer ID
    if (action === 'portal') {
      if (!returnUrl) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'returnUrl is required for portal action' }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
      
      if (!user.stripe_customer_id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'User does not have a Stripe customer ID' }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
      
      const portalSession = await createCustomerPortalSession(user.stripe_customer_id, returnUrl);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ url: portalSession.url }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }
    
    // For other actions, we need the active subscription
    const subscription = await getUserActiveSubscription(userId);
    
    if (!subscription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No active subscription found' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }
    
    let result;
    
    // Perform the requested action
    switch (action) {
      case 'cancel':
        result = await cancelSubscription(subscription);
        break;
      case 'reactivate':
        result = await reactivateSubscription(subscription);
        break;
      case 'update':
        if (!priceId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'priceId is required for update action' }),
            headers: { 'Content-Type': 'application/json' }
          };
        }
        result = await updateSubscription(subscription, priceId);
        break;
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        subscription: {
          id: result.id,
          status: result.status,
          current_period_end: new Date(result.current_period_end * 1000),
          cancel_at_period_end: result.cancel_at_period_end
        }
      }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  } catch (error) {
    console.error('Error managing subscription:', error);
    
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
