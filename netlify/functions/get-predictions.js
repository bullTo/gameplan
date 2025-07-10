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
    const sport = url.searchParams.get('sport');
    const riskLevel = url.searchParams.get('risk_level');
    const betType = url.searchParams.get('bet_type');
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const id = url.searchParams.get('id');

    // Build query
    let query = `SELECT id, user_id, prompt_text, response, created_at, sport, bet_type, parsed_entities FROM prompt_logs WHERE user_id = $1`;
    const params = [userId];
    let paramIndex = 2;

    if (id) {
      query += ` AND id = $${paramIndex}`;
      params.push(id);
      paramIndex++;
    }
    if (sport) {
      query += ` AND sport = $${paramIndex}`;
      params.push(sport);
      paramIndex++;
    }
    if (betType) {
      query += ` AND bet_type = $${paramIndex}`;
      params.push(betType);
      paramIndex++;
    }
    // riskLevel is not a direct column, but could be in parsed_entities
    // Optionally filter by risk_level in parsed_entities JSON
    if (riskLevel) {
      query += ` AND (parsed_entities->>'riskProfile' = $${paramIndex} OR parsed_entities->>'risk_level' = $${paramIndex})`;
      params.push(riskLevel);
      paramIndex++;
    }
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);
    const predictions = result.rows;

     // Get all saved picks for this user
    const savedPicksResult = await pool.query(
      'SELECT prompt_log_id FROM saved_picks WHERE user_id = $1',
      [userId]
    );
    const hitResult = await pool.query(
      "SELECT prompt_log_id FROM saved_picks WHERE status = 'hit'"
    )
    const savedPickIds = new Set(savedPicksResult.rows.map(row => row.prompt_log_id));
    const hittedIds = new Set(hitResult.rows.map(row => row.prompt_log_id));

    // Add pickSaved property to each prediction
    const predictionsWithPickSaved = predictions.map(pred => ({
      ...pred,
      pickSaved: savedPickIds.has(pred.id),
      isHit: hittedIds.has(pred.id)
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ predictions: predictionsWithPickSaved }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error getting predictions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get predictions' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
