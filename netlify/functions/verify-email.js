const { Pool } = require('pg');
const { Resend } = require('resend');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

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
  const token = event.queryStringParameters?.token;
  if (!token) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Token required' }) };
  }

  try {
    const result = await pool.query('SELECT id, email, name FROM users WHERE email_verification_token = $1 AND email_verified = false', [token]);
    if (result.rows.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or expired token' }) };
    }
    await pool.query('UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1', [result.rows[0].id]);
    // Send verification email
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "hello@gameplanai.io",
      to: result.rows[0].email,
      subject: "Welcome to our GamePlan AI App",
      html: `
        <h2>Welcome to GamePlan AI, ${result.rows[0].name.split(" ")[0]}!</h2>
        <p>On behalf of the entire team, I’d like to say how excited we are to have you onboard.</p>
        <p>Welcome aboard, and once again, we're excited to have you with us.</p>
        <br />
        <p>Cheers,<br/>The GamePlan AI Team</p>
      `,
    });
    return { statusCode: 200, body: JSON.stringify({ message: 'Email verified' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
}; 