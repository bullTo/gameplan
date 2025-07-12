require('dotenv').config();

// Netlify function to get user recommendations
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Get user ID from JWT token
function getUserIdFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // The user ID is stored in the 'sub' field of the token
    return decoded.sub || decoded.userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Main handler function
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
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Verify authentication
  const userId = getUserIdFromToken(event.headers.authorization);
  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    console.log(`Fetching recommendations for user ${userId}`);

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const sport = queryParams.sport;
    const limit = parseInt(queryParams.limit) || 9;
    const riskLevel = queryParams.risk_level;

    // Build the query
    let query = 'SELECT * FROM recommendations WHERE user_id = $1';
    const params = [userId];

    // Add filters if provided
    if (sport) {
      query += ' AND sport = $' + (params.length + 1);
      params.push(sport);
    }

    if (riskLevel) {
      query += ' AND risk_level = $' + (params.length + 1);
      params.push(riskLevel);
    }

    // Add ordering and limit
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    // Execute the query
    const result = await pool.query(query, params);

    console.log(`Found ${result.rows.length} recommendations for user ${userId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        recommendations: result.rows
      })
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch recommendations' })
    };
  }
};
