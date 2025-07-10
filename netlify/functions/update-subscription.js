require('dotenv').config();
// Netlify function to update user subscription plan
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
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
    // Parse the request body
    const { email, plan } = JSON.parse(event.body);
    
    if (!email || !plan) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and plan are required' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }
    
    // Validate plan
    if (!['free', 'core', 'pro'].includes(plan)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid plan. Must be one of: free, core, pro' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }
    
    // Update user subscription plan
    const result = await pool.query(
      `UPDATE users 
       SET subscription_plan = $1
       WHERE email = $2
       RETURNING id, email, name, subscription_plan`,
      [plan, email]
    );
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }
    
    const user = result.rows[0];
    
    // Generate a new JWT token with updated subscription info
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Subscription plan updated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription_plan: user.subscription_plan
        },
        token
      }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
    
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update subscription plan' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }
};
