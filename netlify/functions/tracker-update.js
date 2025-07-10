// Netlify function to update the status of a saved pick in the saved_picks table
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
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
    // Authenticate user
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authentication required' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.sub;
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

    // Parse request body
    const parsedBody = JSON.parse(event.body || '{}');
    console.log("=== tracker-update parsed body:", parsedBody);

     // Accept both { pickId, status } and { pickId: { pickId, status } }
    let pickId, status;
    if (typeof parsedBody.pickId === 'object' && parsedBody.pickId !== null) {
      pickId = parsedBody.pickId.pickId;
      status = parsedBody.pickId.status;
    } else {
      pickId = parsedBody.pickId;
      status = parsedBody.status;
    }

    if (!pickId || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'pickId and status are required' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

    // Update the status of the pick
    const updateResult = await pool.query(
      'UPDATE saved_picks SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, pickId, userId]
    );

    if (updateResult.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Pick not found or not owned by user' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ updatedPick: updateResult.rows[0] }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  } catch (error) {
    console.error('Error updating pick status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update pick status' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }
};
