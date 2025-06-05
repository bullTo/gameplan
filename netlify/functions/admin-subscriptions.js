// Netlify function for admin subscription management
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verify admin authentication
const verifyAdmin = async (headers) => {
  const authHeader = headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false, error: 'No token provided' };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token belongs to an admin
    if (decoded.role !== 'admin') {
      return { isAdmin: false, error: 'Not authorized as admin' };
    }

    // Get admin details
    const result = await pool.query(
      'SELECT id FROM admins WHERE id = $1',
      [decoded.sub]
    );

    if (result.rows.length === 0) {
      return { isAdmin: false, error: 'Admin not found' };
    }

    return { isAdmin: true, adminId: decoded.sub };
  } catch (error) {
    return { isAdmin: false, error: 'Invalid token' };
  }
};

exports.handler = async (event) => {
  // Verify admin authentication
  const adminAuth = await verifyAdmin(event.headers);

  if (!adminAuth.isAdmin) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: adminAuth.error }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  // Handle different HTTP methods
  switch (event.httpMethod) {
    case 'GET':
      if (event.path.includes('/plans')) {
        return await getSubscriptionPlans();
      } else if (event.path.includes('/subscriptions')) {
        return await getUserSubscriptions(event);
      }
      break;
    case 'POST':
      if (event.path.includes('/plans')) {
        return await createSubscriptionPlan(event);
      }
      break;
    case 'PUT':
      if (event.path.includes('/plans')) {
        return await updateSubscriptionPlan(event);
      } else if (event.path.includes('/subscriptions')) {
        return await updateUserSubscription(event);
      }
      break;
    case 'DELETE':
      if (event.path.includes('/plans')) {
        return await deleteSubscriptionPlan(event);
      }
      break;
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
        headers: { 'Content-Type': 'application/json' }
      };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
    headers: { 'Content-Type': 'application/json' }
  };
};

// Get all subscription plans
async function getSubscriptionPlans() {
  try {
    // Check if subscription_plans table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'subscription_plans'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create the subscription_plans table if it doesn't exist
      await pool.query(`
        CREATE TABLE subscription_plans (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          key VARCHAR(50) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          billing_cycle VARCHAR(50) NOT NULL,
          features JSONB,
          is_default BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Insert default plans
      await pool.query(`
        INSERT INTO subscription_plans (name, key, price, billing_cycle, features, is_default, is_active)
        VALUES
          ('Free', 'free', 0, 'monthly', '["3 AI prompts per day", "Basic predictions", "No tracker access"]', true, true),
          ('Core', 'core', 49, 'monthly', '["15 AI prompts per day", "Advanced predictions", "Tracker access", "Email support"]', false, true),
          ('Pro', 'pro', 99, 'monthly', '["30 AI prompts per day", "Premium predictions", "Advanced tracker", "Priority support", "Custom recommendations"]', false, true),
          ('Core Annual', 'core', 490, 'annual', '["15 AI prompts per day", "Advanced predictions", "Tracker access", "Email support"]', false, true),
          ('Pro Annual', 'pro', 990, 'annual', '["30 AI prompts per day", "Premium predictions", "Advanced tracker", "Priority support", "Custom recommendations"]', false, true);
      `);
    }

    // Get all subscription plans
    const result = await pool.query(`
      SELECT id, name, key, price, billing_cycle, features, is_default, is_active, created_at, updated_at
      FROM subscription_plans
      ORDER BY price ASC
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        plans: result.rows
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get subscription plans' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Create a new subscription plan
async function createSubscriptionPlan(event) {
  try {
    const { name, key, price, billing_cycle, features, is_default, is_active } = JSON.parse(event.body);

    // Validate input
    if (!name || !key || price === undefined || !billing_cycle) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name, key, price, and billing cycle are required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // If this plan is set as default, unset any existing default plan
    if (is_default) {
      await pool.query(
        'UPDATE subscription_plans SET is_default = false WHERE is_default = true'
      );
    }

    // Insert new plan
    const result = await pool.query(
      `INSERT INTO subscription_plans (name, key, price, billing_cycle, features, is_default, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, key, price, billing_cycle, features, is_default, is_active, created_at, updated_at`,
      [name, key, price, billing_cycle, JSON.stringify(features || []), is_default || false, is_active || true]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Subscription plan created successfully',
        plan: result.rows[0]
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create subscription plan' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Update a subscription plan
async function updateSubscriptionPlan(event) {
  try {
    const { id, name, key, price, billing_cycle, features, is_default, is_active } = JSON.parse(event.body);

    // Validate input
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Plan ID is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Check if plan exists
    const checkResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Subscription plan not found' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // If this plan is set as default, unset any existing default plan
    if (is_default) {
      await pool.query(
        'UPDATE subscription_plans SET is_default = false WHERE is_default = true AND id != $1',
        [id]
      );
    }

    // Update plan
    const result = await pool.query(
      `UPDATE subscription_plans
       SET name = $1, key = $2, price = $3, billing_cycle = $4, features = $5, is_default = $6, is_active = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING id, name, key, price, billing_cycle, features, is_default, is_active, created_at, updated_at`,
      [name, key, price, billing_cycle, JSON.stringify(features || []), is_default, is_active, id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Subscription plan updated successfully',
        plan: result.rows[0]
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update subscription plan' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Delete a subscription plan
async function deleteSubscriptionPlan(event) {
  try {
    const id = event.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Plan ID is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Check if plan exists
    const checkResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Subscription plan not found' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Check if plan is the default plan
    if (checkResult.rows[0].is_default) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cannot delete the default plan' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Delete plan
    await pool.query('DELETE FROM subscription_plans WHERE id = $1', [id]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Subscription plan deleted successfully'
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete subscription plan' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Get user subscriptions
async function getUserSubscriptions(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const {
      page = 1,
      limit = 10,
      status = '',
      plan_key = '',
      search = ''
    } = queryParams;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Check if user_subscriptions table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'user_subscriptions'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create the user_subscriptions table if it doesn't exist
      await pool.query(`
        CREATE TABLE user_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          plan_id INTEGER REFERENCES subscription_plans(id) ON DELETE SET NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          start_date DATE NOT NULL,
          end_date DATE,
          amount DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Build the query
    let query = `
      SELECT
        us.id,
        us.user_id,
        u.name as user_name,
        u.email as user_email,
        sp.name as plan_name,
        sp.key as plan_key,
        sp.billing_cycle,
        us.status,
        us.start_date,
        us.end_date,
        us.amount,
        us.created_at,
        us.updated_at
      FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE 1=1
    `;

    const queryParams2 = [];

    // Add filters
    if (status) {
      query += ` AND us.status = $${queryParams2.length + 1}`;
      queryParams2.push(status);
    }

    if (plan_key) {
      query += ` AND sp.key = $${queryParams2.length + 1}`;
      queryParams2.push(plan_key);
    }

    if (search) {
      query += ` AND (u.name ILIKE $${queryParams2.length + 1} OR u.email ILIKE $${queryParams2.length + 1})`;
      queryParams2.push(`%${search}%`);
    }

    // Add order by and pagination
    query += ` ORDER BY us.created_at DESC LIMIT $${queryParams2.length + 1} OFFSET $${queryParams2.length + 2}`;
    queryParams2.push(parseInt(limit), offset);

    // Execute the query
    const result = await pool.query(query, queryParams2);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE 1=1
    `;

    const countParams = [];

    // Add filters to count query
    if (status) {
      countQuery += ` AND us.status = $${countParams.length + 1}`;
      countParams.push(status);
    }

    if (plan_key) {
      countQuery += ` AND sp.key = $${countParams.length + 1}`;
      countParams.push(plan_key);
    }

    if (search) {
      countQuery += ` AND (u.name ILIKE $${countParams.length + 1} OR u.email ILIKE $${countParams.length + 1})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return {
      statusCode: 200,
      body: JSON.stringify({
        subscriptions: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get user subscriptions' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

// Update a user subscription
async function updateUserSubscription(event) {
  try {
    const { id, plan_id, status, end_date } = JSON.parse(event.body);

    // Validate input
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Subscription ID is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Check if subscription exists
    const checkResult = await pool.query(
      'SELECT * FROM user_subscriptions WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User subscription not found' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Build update query
    let query = 'UPDATE user_subscriptions SET updated_at = NOW()';
    const queryParams = [id];

    if (plan_id) {
      // Get plan details to update amount
      const planResult = await pool.query(
        'SELECT price FROM subscription_plans WHERE id = $1',
        [plan_id]
      );

      if (planResult.rows.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Subscription plan not found' }),
          headers: { 'Content-Type': 'application/json' }
        };
      }

      query += `, plan_id = $${queryParams.length + 1}, amount = $${queryParams.length + 2}`;
      queryParams.push(plan_id, planResult.rows[0].price);
    }

    if (status) {
      query += `, status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (end_date) {
      query += `, end_date = $${queryParams.length + 1}`;
      queryParams.push(end_date);
    }

    query += ' WHERE id = $1 RETURNING *';

    // Execute update
    const result = await pool.query(query, queryParams);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User subscription updated successfully',
        subscription: result.rows[0]
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update user subscription' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
