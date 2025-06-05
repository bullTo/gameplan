// Netlify function for admin authentication
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to generate JWT token for admin
const generateAdminToken = (adminId, email) => {
  return jwt.sign(
    {
      sub: adminId,
      email,
      role: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
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
      case 'login':
        return await handleAdminLogin(data);
      case 'verify':
        return await verifyAdminToken(event.headers);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' }),
          headers: { 'Content-Type': 'application/json' }
        };
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

// Handle admin login
async function handleAdminLogin(data) {
  const { email, password } = data;

  // Validate input
  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email and password are required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Check if admins table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admins'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      // Create the admins table if it doesn't exist
      await pool.query(`
        CREATE TABLE admins (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP WITH TIME ZONE
        );
      `);
      
      // Create a default admin if specified in environment variables
      if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
        
        await pool.query(
          `INSERT INTO admins (name, email, password_hash)
           VALUES ($1, $2, $3)
           ON CONFLICT (email) DO NOTHING`,
          ['Admin', process.env.ADMIN_EMAIL, hashedPassword]
        );
      }
    }

    // Find admin by email
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const admin = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Generate JWT token
    const token = generateAdminToken(admin.id, admin.email);

    // Update last login timestamp
    await pool.query(
      'UPDATE admins SET last_login = NOW() WHERE id = $1',
      [admin.id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Admin login successful',
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin'
        },
        token
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to login' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Verify admin token
async function verifyAdminToken(headers) {
  const authHeader = headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No token provided' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the token belongs to an admin
    if (decoded.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Not authorized as admin' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    // Get admin details
    const result = await pool.query(
      'SELECT id, name, email FROM admins WHERE id = $1',
      [decoded.sub]
    );
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Admin not found' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    const admin = result.rows[0];
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Token is valid',
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin'
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
