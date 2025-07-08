require('dotenv').config();


// Netlify function for authentication (login and registration)
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require("resend");
const crypto = require('crypto');

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to generate JWT token
const generateToken = (userId, email, role = 'user') => {
  return jwt.sign(
    {
      sub: userId,
      email,
      role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

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

exports.handler = async (event) => {
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

    // Handle different authentication actions
    switch (action) {
      case 'register':
        return await handleRegister(data);
      case 'login':
        return await handleLogin(data);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' }),
          headers: { 'Content-Type': 'application/json' }
        };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

// Handle user registration
async function handleRegister(data) {
  const { name, email, password, agreeToTerms } = data;

  // Validate input
  if (!name || !email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Name, email, and password are required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  if (!agreeToTerms) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'You must agree to the Terms and Conditions' }),
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
    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'User with this email already exists' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token and expiry
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours expiry

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, subscription_plan, created_at, last_login, email_verified, email_verification_token, email_verification_token_expiry)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, $6, $7)
       RETURNING id, email, subscription_plan`,
      [name, email, hashedPassword, 'free', false, verificationToken, verificationTokenExpiry]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Send verification email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const verifyUrl = `${process.env.VITE_APP_DOMAIN || 'https://yourdomain.com'}/verify-email?token=${verificationToken}`;
    await resend.emails.send({
      from: "hello@gameplanai.io",
      to: email,
      subject: "Verify your email for GamePlan AI",
      html: `
        <h2>Welcome to GamePlan AI, ${name.split(" ")[0]}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
        <br />
        <p>Cheers,<br/>The GamePlan AI Team</p>
      `,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: name,
          subscription_plan: user.subscription_plan
        },
        token
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to register user' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Handle user login
async function handleLogin(data) {
  const { email, password, rememberMe } = data;

  // Validate input
  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email and password are required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT id, name, email, password_hash, subscription_plan, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    if ( !user.email_verified )
    {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Email not verified' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    // Generate JWT token with longer expiry if rememberMe is true
    const tokenExpiry = rememberMe ? '30d' : (process.env.JWT_EXPIRY || '7d');
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Update last login timestamp
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription_plan: user.subscription_plan
        },
        token
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to login' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
