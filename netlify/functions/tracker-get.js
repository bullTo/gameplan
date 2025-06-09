require('dotenv').config();
// Netlify function to get saved picks from the saved_picks table
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Authenticate user
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authentication required' }),
        headers: { 'Content-Type': 'application/json' }
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
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Parse query parameters
    const url = new URL(event.rawUrl || `http://localhost${event.path}${event.queryString ? '?' + event.queryString : ''}`);
    const status = url.searchParams.get('status');
    const sport = url.searchParams.get('sport');
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    // Build query
    let query = `SELECT * FROM saved_picks WHERE user_id = $1`;
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (sport) {
      query += ` AND sport = $${paramIndex}`;
      params.push(sport);
      paramIndex++;
    }
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      statusCode: 200,
      body: JSON.stringify({ savedPicks: result.rows }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error getting saved picks:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get saved picks' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
