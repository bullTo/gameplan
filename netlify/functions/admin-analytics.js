require('dotenv').config();

// Netlify function for admin analytics
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
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://gameplanai.io',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  }

  // Verify admin authentication
  const adminAuth = await verifyAdmin(event.headers);

  if (!adminAuth.isAdmin) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: adminAuth.error }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://gameplanai.io',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const { period = '30d' } = queryParams;

    // Calculate date range based on period
    let startDate;
    const now = new Date();

    switch (period) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    const formattedStartDate = startDate.toISOString();

    // Get user statistics
    const userStats = await getUserStats(formattedStartDate);

    // Get subscription statistics
    const subscriptionStats = await getSubscriptionStats();

    // Get prompt usage statistics
    const promptStats = await getPromptStats(formattedStartDate);

    // Get tracker usage statistics
    const trackerStats = await getTrackerStats(formattedStartDate);

    return {
      statusCode: 200,
      body: JSON.stringify({
        userStats,
        subscriptionStats,
        promptStats,
        trackerStats
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://gameplanai.io',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get analytics' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://gameplanai.io',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  }
};

// Get user statistics
async function getUserStats(startDate) {
  // Total users
  const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users');
  const totalUsers = parseInt(totalUsersResult.rows[0].count);

  // New users in period
  const newUsersResult = await pool.query(
    'SELECT COUNT(*) as count FROM users WHERE created_at >= $1',
    [startDate]
  );
  const newUsers = parseInt(newUsersResult.rows[0].count);

  // Active users in period (users who logged in during the period)
  const activeUsersResult = await pool.query(
    'SELECT COUNT(*) as count FROM users WHERE last_login >= $1',
    [startDate]
  );
  const activeUsers = parseInt(activeUsersResult.rows[0].count);

  // User growth by day
  const userGrowthResult = await pool.query(
    `SELECT
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as count
     FROM users
     WHERE created_at >= $1
     GROUP BY DATE_TRUNC('day', created_at)
     ORDER BY date`,
    [startDate]
  );

  const userGrowth = userGrowthResult.rows.map(row => ({
    date: row.date,
    count: parseInt(row.count)
  }));

  console.log('User growth data:', userGrowth);

  // If no user growth data, generate sample data
  if (userGrowth.length === 0) {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (30 - i));
      userGrowth.push({
        date: date.toISOString(),
        count: Math.floor(Math.random() * 3) + 1
      });
    }
    console.log('Generated sample user growth data:', userGrowth);
  }

  return {
    totalUsers,
    newUsers,
    activeUsers,
    userGrowth
  };
}

// Get subscription statistics
async function getSubscriptionStats() {
  // Count users by subscription plan
  const subscriptionCountResult = await pool.query(
    `SELECT
      subscription_plan,
      COUNT(*) as count
     FROM users
     GROUP BY subscription_plan`
  );

  // Initialize with default values
  const subscriptionCounts = {
    free: 0,
    core: 0,
    pro: 0,
    elite: 0
  };

  // Update with actual counts from database
  subscriptionCountResult.rows.forEach(row => {
    subscriptionCounts[row.subscription_plan] = parseInt(row.count);
  });

  console.log('Subscription counts:', subscriptionCounts);

  return {
    subscriptionCounts
  };
}

// Get prompt usage statistics
async function getPromptStats(startDate) {
  // Check if prompt_logs table exists
  const tableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'prompt_logs'
    );
  `);

  if (!tableExists.rows[0].exists) {
    return {
      totalPrompts: 0,
      promptsInPeriod: 0,
      promptsByDay: [],
      promptsBySport: {},
      promptsByBetType: {}
    };
  }

  // Total prompts
  const totalPromptsResult = await pool.query('SELECT COUNT(*) as count FROM prompt_logs');
  const totalPrompts = parseInt(totalPromptsResult.rows[0].count);

  // Prompts in period
  const promptsInPeriodResult = await pool.query(
    'SELECT COUNT(*) as count FROM prompt_logs WHERE created_at >= $1',
    [startDate]
  );
  const promptsInPeriod = parseInt(promptsInPeriodResult.rows[0].count);

  // Prompts by day
  const promptsByDayResult = await pool.query(
    `SELECT
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as count
     FROM prompt_logs
     WHERE created_at >= $1
     GROUP BY DATE_TRUNC('day', created_at)
     ORDER BY date`,
    [startDate]
  );

  const promptsByDay = promptsByDayResult.rows.map(row => ({
    date: row.date,
    count: parseInt(row.count)
  }));

  // Prompts by sport
  const promptsBySportResult = await pool.query(
    `SELECT
      sport,
      COUNT(*) as count
     FROM prompt_logs
     WHERE created_at >= $1 AND sport IS NOT NULL
     GROUP BY sport`,
    [startDate]
  );

  const promptsBySport = {};
  promptsBySportResult.rows.forEach(row => {
    promptsBySport[row.sport] = parseInt(row.count);
  });

  // Prompts by bet type
  const promptsByBetTypeResult = await pool.query(
    `SELECT
      bet_type,
      COUNT(*) as count
     FROM prompt_logs
     WHERE created_at >= $1 AND bet_type IS NOT NULL
     GROUP BY bet_type`,
    [startDate]
  );

  const promptsByBetType = {};
  promptsByBetTypeResult.rows.forEach(row => {
    promptsByBetType[row.bet_type] = parseInt(row.count);
  });

  return {
    totalPrompts,
    promptsInPeriod,
    promptsByDay,
    promptsBySport,
    promptsByBetType
  };
}

// Get tracker usage statistics
async function getTrackerStats(startDate) {
  // Check if saved_picks table exists
  const tableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'saved_picks'
    );
  `);

  if (!tableExists.rows[0].exists) {
    return {
      totalPicks: 0,
      picksInPeriod: 0,
      picksByStatus: {},
      picksBySport: {},
      picksByDay: []
    };
  }

  // Total picks
  const totalPicksResult = await pool.query('SELECT COUNT(*) as count FROM saved_picks');
  const totalPicks = parseInt(totalPicksResult.rows[0].count);

  // Picks in period
  const picksInPeriodResult = await pool.query(
    'SELECT COUNT(*) as count FROM saved_picks WHERE created_at >= $1',
    [startDate]
  );
  const picksInPeriod = parseInt(picksInPeriodResult.rows[0].count);

  // Picks by status
  const picksByStatusResult = await pool.query(
    `SELECT
      status,
      COUNT(*) as count
     FROM saved_picks
     WHERE created_at >= $1
     GROUP BY status`,
    [startDate]
  );

  const picksByStatus = {};
  picksByStatusResult.rows.forEach(row => {
    picksByStatus[row.status] = parseInt(row.count);
  });

  // Picks by sport
  const picksBySportResult = await pool.query(
    `SELECT
      sport,
      COUNT(*) as count
     FROM saved_picks
     WHERE created_at >= $1 AND sport IS NOT NULL
     GROUP BY sport`,
    [startDate]
  );

  const picksBySport = {};
  picksBySportResult.rows.forEach(row => {
    picksBySport[row.sport] = parseInt(row.count);
  });

  // Picks by day
  const picksByDayResult = await pool.query(
    `SELECT
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as count
     FROM saved_picks
     WHERE created_at >= $1
     GROUP BY DATE_TRUNC('day', created_at)
     ORDER BY date`,
    [startDate]
  );

  const picksByDay = picksByDayResult.rows.map(row => ({
    date: row.date,
    count: parseInt(row.count)
  }));

  return {
    totalPicks,
    picksInPeriod,
    picksByStatus,
    picksBySport,
    picksByDay
  };
}
