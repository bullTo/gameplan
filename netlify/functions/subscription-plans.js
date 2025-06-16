require('dotenv').config();

// Netlify function to get subscription plans
const { Pool } = require('pg');
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

// Get all subscription plans
async function getSubscriptionPlans() {
  try {
    // Get all subscription plans
    const result = await pool.query(`
      SELECT id, name, key, price, features, is_default, is_active, created_at, updated_at
      FROM subscription_plans
      ORDER BY price ASC
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        plans: result.rows.map(plan => ({
          id: plan.id,
          name: plan.name.charAt(0).toUpperCase() + plan.name.slice(1), // Capitalize first letter
          key: plan.name, // Use name as key
          price: plan.price, // Use monthly price
          features: typeof plan.features === 'string'
            ? Object.keys(JSON.parse(plan.features)).map(key => `${key}: ${JSON.parse(plan.features)[key]}`)
            : Object.keys(plan.features).map(key => `${key}: ${plan.features[key]}`),
          is_default: plan.is_default, // Free plan is default
          is_active: plan.is_active,
          created_at: plan.created_at,
          updated_at: plan.updated_at
        }))
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get subscription plans' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Netlify function handler
exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Get authorization token
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    verifyToken(token);

    // Get subscription plans
    return await getSubscriptionPlans();
  } catch (error) {
    console.error('Error in subscription-plans function:', error);

    return {
      statusCode: error.message === 'Invalid token' ? 401 : 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
