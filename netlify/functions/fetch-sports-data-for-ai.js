require('dotenv').config();

// Function to fetch sports data from our JSONB tables for AI analysis
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
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const sport = queryParams.sport?.toLowerCase() || 'all';

    // Define date range based on the actual data we have in the database
    // NHL: 2025-05-09, NBA/NFL/MLB: 2025-05-11
    const startDate = '2025-05-09';
    const endDate = '2025-05-12';

    console.log(`Fetching ${sport} data from ${startDate} to ${endDate}`);

    // Fetch data based on sport
    let sportsData = {};

    if (sport === 'all') {
      // Fetch data for all sports
      sportsData = {
        nba: await fetchSportData('nba_data', startDate, endDate),
        nhl: await fetchSportData('nhl_data', startDate, endDate),
        mlb: await fetchSportData('mlb_data', startDate, endDate),
        nfl: await fetchSportData('nfl_data', startDate, endDate)
      };
    } else if (['nba', 'nhl', 'mlb', 'nfl'].includes(sport)) {
      // Fetch data for specific sport
      sportsData[sport] = await fetchSportData(`${sport}_data`, startDate, endDate);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid sport',
          message: 'Sport must be one of: nba, nhl, mlb, nfl, or all'
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(sportsData),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error) {
    console.error('Error fetching sports data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch sports data',
        message: error.message
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

/**
 * Fetch data for a specific sport within a date range
 * @param {string} table - Table name
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Sports data
 */
async function fetchSportData(table, startDate, endDate) {
  const client = await pool.connect();

  try {
    console.log(`Querying ${table} for dates ${startDate} to ${endDate}`);

    // Query the database for data within the date range
    const result = await client.query(
      `SELECT date, scores_data, standings_data, schedule_data
       FROM ${table}
       WHERE date BETWEEN $1 AND $2
       ORDER BY date`,
      [startDate, endDate]
    );

    console.log(`Found ${result.rows.length} days of data for ${table}`);

    // Process the results
    const processedData = {
      scores: [],
      standings: null,
      schedule: null
    };

    // Process each day's data
    result.rows.forEach(row => {
      // Format the date to handle timezone issues
      const dateObj = new Date(row.date);
      const formattedDate = dateObj.toISOString().split('T')[0];

      console.log(`Processing data for ${table} on ${formattedDate}`);

      // Add scores data if available
      if (row.scores_data) {
        processedData.scores.push({
          date: formattedDate,
          data: row.scores_data
        });
      }

      // Use the most recent standings data
      if (row.standings_data) {
        processedData.standings = row.standings_data;
      }

      // Use the most recent schedule data
      if (row.schedule_data) {
        processedData.schedule = row.schedule_data;
      }
    });

    return processedData;
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    throw error;
  } finally {
    client.release();
  }
}
