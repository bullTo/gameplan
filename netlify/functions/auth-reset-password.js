require('dotenv').config();
// Netlify function for password reset
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate password strength
const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Helper function to generate a random token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { action } = data;

    // Handle different password reset actions
    switch (action) {
      case 'request':
        return await handleResetRequest(data);
      case 'verify':
        return await handleVerifyToken(data);
      case 'reset':
        return await handlePasswordReset(data);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' }),
          headers: { 'Content-Type': 'application/json' }
        };
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

// Handle password reset request
async function handleResetRequest(data) {
  const { email } = data;

  // Validate input
  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email is required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  if (!isValidEmail(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid email format' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Check if user exists
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length === 0) {
      // Don't reveal that the user doesn't exist for security reasons
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'If your email is registered, you will receive a password reset link'
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const userId = checkResult.rows[0].id;

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Store reset token in database
    await pool.query(
      `UPDATE users
       SET reset_token = $1, reset_token_expiry = $2
       WHERE id = $3`,
      [resetToken, resetTokenExpiry, userId]
    );

    // In a real application, you would send an email with the reset link
    // For this example, we'll just return the token in the response
    // In production, NEVER return the token directly to the client

    console.log(`Reset token for ${email}: ${resetToken}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'If your email is registered, you will receive a password reset link',
        // The following would be removed in production:
        debug: {
          resetToken,
          resetUrl: `${process.env.VITE_APP_DOMAIN}/reset-password?token=${resetToken}`
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Reset request error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process reset request' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Handle token verification
async function handleVerifyToken(data) {
  const { token } = data;

  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Token is required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Check if token exists and is valid
    const result = await pool.query(
      `SELECT id, reset_token_expiry
       FROM users
       WHERE reset_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const user = result.rows[0];
    const now = new Date();
    const tokenExpiry = new Date(user.reset_token_expiry);

    if (now > tokenExpiry) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token has expired' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Token is valid',
        userId: user.id
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to verify token' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Handle password reset
async function handlePasswordReset(data) {
  const { token, password } = data;

  if (!token || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Token and password are required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  if (!isValidPassword(password)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Check if token exists and is valid
    const result = await pool.query(
      `SELECT id, reset_token_expiry
       FROM users
       WHERE reset_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const user = result.rows[0];
    const now = new Date();
    const tokenExpiry = new Date(user.reset_token_expiry);

    if (now > tokenExpiry) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token has expired' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password and clear the reset token
    await pool.query(
      `UPDATE users
       SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Password has been reset successfully' }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to reset password' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
