require('dotenv').config();

// Function to test the sports database tables
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  try {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

    // Get database info
    const dbInfo = await getDatabaseInfo();
    
    return {
      statusCode: 200,
      body: JSON.stringify(dbInfo, null, 2),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
    
  } catch (error) {
    console.error('Error testing sports database:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to test sports database',
        message: error.message,
        stack: error.stack
      }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }
};

/**
 * Get information about the sports database tables
 * @returns {Promise<Object>} Database information
 */
async function getDatabaseInfo() {
  const client = await pool.connect();
  
  try {
    const info = {
      tables: {},
      sportsTables: {}
    };
    
    // Get list of all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    info.tables.list = tablesResult.rows.map(row => row.table_name);
    
    // Check sports tables specifically
    const sportsTables = ['nfl_data', 'nba_data', 'nhl_data', 'mlb_data'];
    
    for (const table of sportsTables) {
      try {
        // Check if table exists
        const tableExists = info.tables.list.includes(table);
        
        if (!tableExists) {
          info.sportsTables[table] = { exists: false };
          continue;
        }
        
        // Get row count
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const rowCount = parseInt(countResult.rows[0].count);
        
        // Get date range
        const dateRangeResult = await client.query(`
          SELECT 
            MIN(date) as min_date, 
            MAX(date) as max_date 
          FROM ${table}
        `);
        
        const minDate = dateRangeResult.rows[0].min_date;
        const maxDate = dateRangeResult.rows[0].max_date;
        
        // Get sample data for May 10-12, 2025
        const sampleDataResult = await client.query(`
          SELECT 
            date, 
            CASE WHEN scores_data IS NOT NULL THEN true ELSE false END as has_scores,
            CASE WHEN standings_data IS NOT NULL THEN true ELSE false END as has_standings,
            CASE WHEN schedule_data IS NOT NULL THEN true ELSE false END as has_schedule
          FROM ${table}
          WHERE date BETWEEN '2025-05-10' AND '2025-05-12'
          ORDER BY date
        `);
        
        info.sportsTables[table] = {
          exists: true,
          rowCount,
          dateRange: {
            min: minDate,
            max: maxDate
          },
          sampleData: sampleDataResult.rows
        };
      } catch (error) {
        info.sportsTables[table] = { 
          exists: true,
          error: error.message
        };
      }
    }
    
    return info;
  } catch (error) {
    console.error(`Error getting database info:`, error);
    throw error;
  } finally {
    client.release();
  }
}
