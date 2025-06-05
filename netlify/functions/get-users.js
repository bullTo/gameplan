// Netlify function to get users
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Get admin ID from JWT token
function getAdminIdFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if the user has admin role
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded.sub;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Main handler function
exports.handler = async (event, context) => {
  // Verify admin authentication
  console.log('Auth header:', event.headers.authorization ? 'Present' : 'Missing');

  const adminId = getAdminIdFromToken(event.headers.authorization);
  if (!adminId) {
    console.log('Admin authentication failed');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  console.log('Admin authenticated:', adminId);

  // Handle different HTTP methods
  switch (event.httpMethod) {
    case 'GET':
      return await handleGetUsers(event, adminId);
    case 'POST':
      return await handleCreateUser(event, adminId);
    case 'PUT':
      return await handleUpdateUser(event, adminId);
    case 'DELETE':
      return await handleDeleteUser(event, adminId);
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
        headers: { 'Content-Type': 'application/json' }
      };
  }
};

// Get users (with pagination and filtering)
async function handleGetUsers(event, adminId) {
  try {
    console.log(`Admin ${adminId} is fetching users`);

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const subscriptionOnly = queryParams.subscription_only === 'true';
    const limit = parseInt(queryParams.limit) || 100;
    const offset = parseInt(queryParams.offset) || 0;

    // Build the query
    let query = `
      SELECT
        id,
        email,
        name,
        created_at,
        updated_at,
        last_login,
        subscription_plan,
        subscription_status,
        subscription_end_date,
        daily_prompt_count,
        prompt_count_reset_date
      FROM users
    `;

    const params = [];

    // Add filter for subscription_only if specified
    if (subscriptionOnly) {
      query += ` WHERE subscription_plan != 'free' AND subscription_status = 'active'`;
    }

    // Add ordering and pagination
    const sortBy = queryParams.sort_by || 'created_at';
    const sortOrder = queryParams.sort_order === 'asc' ? 'ASC' : 'DESC';

    // Validate sort_by to prevent SQL injection
    const validSortColumns = ['created_at', 'name', 'email', 'last_login', 'subscription_plan'];
    const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'created_at';

    query += ` ORDER BY ${safeSort} ${sortOrder} LIMIT $1 OFFSET $2`;
    params.push(limit, offset);

    // Execute the query
    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    if (subscriptionOnly) {
      countQuery += ` WHERE subscription_plan != 'free' AND subscription_status = 'active'`;
    }
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total);

    console.log(`Found ${result.rows.length} users`);

    // Format response based on query parameters
    if (queryParams.page) {
      // Format for the Users page (with pagination)
      return {
        statusCode: 200,
        body: JSON.stringify({
          users: result.rows,
          pagination: {
            total,
            page: parseInt(queryParams.page) || 1,
            limit: parseInt(queryParams.limit) || 10,
            pages: Math.ceil(total / (parseInt(queryParams.limit) || 10))
          }
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    } else {
      // Format for the Subscriptions page (with offset/limit)
      return {
        statusCode: 200,
        body: JSON.stringify({
          users: result.rows,
          total,
          limit,
          offset
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch users' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Create a new user
async function handleCreateUser(event, adminId) {
  try {
    const { name, email, password, subscription_plan = 'free' } = JSON.parse(event.body);

    // Validate input
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name, email, and password are required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

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
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, subscription_plan, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email, subscription_plan, created_at`,
      [name, email, hashedPassword, subscription_plan]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'User created successfully',
        user: result.rows[0]
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create user' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Update a user
async function handleUpdateUser(event, adminId) {
  try {
    const { id, name, email, password, subscription_plan } = JSON.parse(event.body);

    // Validate input
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Check if user exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Build update query
    let query = 'UPDATE users SET ';
    const queryParams = [id];
    const updates = [];

    if (name) {
      updates.push(`name = $${queryParams.length + 1}`);
      queryParams.push(name);
    }

    if (email) {
      updates.push(`email = $${queryParams.length + 1}`);
      queryParams.push(email);
    }

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push(`password_hash = $${queryParams.length + 1}`);
      queryParams.push(hashedPassword);
    }

    if (subscription_plan) {
      updates.push(`subscription_plan = $${queryParams.length + 1}`);
      queryParams.push(subscription_plan);
    }

    // If no updates, return early
    if (updates.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No updates provided' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    query += updates.join(', ') + ' WHERE id = $1 RETURNING id, name, email, subscription_plan, created_at, last_login';

    // Execute update
    const result = await pool.query(query, queryParams);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User updated successfully',
        user: result.rows[0]
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update user' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Delete a user
async function handleDeleteUser(event, adminId) {
  try {
    const id = event.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Check if user exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User deleted successfully'
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete user' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
