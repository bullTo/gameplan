const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

exports.handler = async (event) => {
  const token = event.queryStringParameters?.token;
  if (!token) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Token required' }) };
  }

  try {
    const result = await pool.query('SELECT id FROM users WHERE email_verification_token = $1 AND email_verified = false', [token]);
    if (result.rows.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or expired token' }) };
    }
    await pool.query('UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1', [result.rows[0].id]);
    return { statusCode: 200, body: JSON.stringify({ message: 'Email verified' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
}; 