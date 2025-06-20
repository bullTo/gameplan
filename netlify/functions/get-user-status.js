const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { DatabaseBackup } = require('lucide-react');

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
    throw new Error('Invalid token');
  }
}

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Get the authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authorization header required' })
      };
    }

    // Extract and verify the token
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Get user ID from query parameters
    let { userId } = event.queryStringParameters || {};
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }
    userId = decoded.sub;

    // Verify that the user is requesting their own status or is an admin
    if (!userId || decoded.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Access denied' })
      };
    }

    // Query the database for user status
    const result = await pool.query(
      `SELECT status, subscription_plan 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const user = result.rows[0];
    
    // Return user status
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        status: user.status || 'inactive',
        subscription_plan: user.subscription_plan || 'free'
      })
    };

  } catch (error) {
    console.error('Error getting user status:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
}; 