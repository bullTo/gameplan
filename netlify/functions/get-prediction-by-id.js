require('dotenv').config();

// Netlify function to get predictions from the prompt_logs table
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

    // Parse query parameters
    const url = new URL(event.rawUrl || `http://localhost${event.path}${event.queryString ? '?' + event.queryString : ''}`);
    const id = url.searchParams.get('id');

    // Build query
    let query = `SELECT id, user_id, prompt_text, response, created_at, sport, bet_type, parsed_entities FROM prompt_logs WHERE id = $1`;
    const params = [id];

    const result = await pool.query(query, params);
    const prediction = result.rows

    //  Get all saved picks for this user
    const savedPicksResult = await pool.query(
      'SELECT id FROM saved_picks WHERE prompt_log_id = $1',
      [id]
    );


    // Add pickSaved property to each prediction
    const predictionWithPickSaved = prediction?.map(pred => ({
      ...pred,
      pickSaved: savedPicksResult.rows.length > 0 ? true : false
    }));

    console.log(prediction)
    return {
      statusCode: 200,
      body: JSON.stringify({ predictionWithPickSaved }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  } catch (error) {
    console.error('Error getting predictions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get predictions' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }
};
