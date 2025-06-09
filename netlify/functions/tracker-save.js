// Netlify function to save a pick to the saved_picks table
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
  if (event.httpMethod !== 'POST') {
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

    // Parse pick data
    const data = JSON.parse(event.body);
    const { playText, promptLogId, reasoning, sport, betType, metadata } = data;

    if (!playText) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'playText is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Insert pick into saved_picks table
    const result = await pool.query(
      `INSERT INTO saved_picks (user_id, play_text, prompt_log_id, reasoning, sport, bet_type, metadata, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
       RETURNING id, user_id, play_text, prompt_log_id, reasoning, sport, bet_type, metadata, status, created_at`,
      [userId, playText, promptLogId || null, reasoning || null, sport || null, betType || null, metadata ? JSON.stringify(metadata) : null]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Pick saved successfully',
        pick: result.rows[0]
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error saving pick:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save pick' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
