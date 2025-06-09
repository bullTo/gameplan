require('dotenv').config();

// Utility functions for sports data collection
const { Pool } = require('pg');
const fetch = require('node-fetch');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// GoalServe API configuration
const GOALSERVE_BASE_URL = 'https://www.goalserve.com/getfeed';
const GOALSERVE_API_KEY = process.env.GOALSERVE_API_KEY;

/**
 * Format a date object to DD.MM.YYYY format for GoalServe API
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
}

/**
 * Get yesterday's date
 * @returns {string} Yesterday's date in DD.MM.YYYY format
 */
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Fetch data from GoalServe API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} JSON response
 */
async function fetchFromGoalServe(endpoint, params = {}) {
  try {
    // Add json=1 parameter
    params.json = 1;

    // Build query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    // Build full URL
    const url = `${GOALSERVE_BASE_URL}/${GOALSERVE_API_KEY}/${endpoint}${queryString ? `?${queryString}` : ''}`;

    console.log(`Fetching data from: ${url.replace(GOALSERVE_API_KEY, 'API_KEY')}`);

    // Make the request
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`GoalServe API error: ${response.status} ${response.statusText}`);
    }

    // Get response text
    const text = await response.text();

    // Try to parse as JSON
    try {
      // Check if the response is empty
      if (!text || text.trim() === '') {
        console.log('Empty response from API');
        return { empty: true };
      }

      // Parse the JSON
      const data = JSON.parse(text);

      // Log the top-level keys for debugging
      console.log('Response top-level keys:', Object.keys(data));

      return data;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.error('Response text (first 200 chars):', text.substring(0, 200));

      // Return a structured error object instead of throwing
      return {
        error: true,
        message: 'Invalid JSON response from GoalServe API',
        responsePreview: text.substring(0, 500)
      };
    }
  } catch (error) {
    console.error(`Error fetching from GoalServe:`, error);

    // Return a structured error object
    return {
      error: true,
      message: error.message,
      details: error.stack
    };
  }
}

/**
 * Store data in the database
 * @param {string} table - Table name
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} dataType - Type of data (scores, standings, schedule)
 * @param {Object} data - JSON data to store
 * @returns {Promise<Object>} Database result
 */
async function storeData(table, date, dataType, data) {
  const client = await pool.connect();

  try {
    // Check if the data is an error object
    if (data && data.error === true) {
      console.warn(`Not storing error data for ${table}/${dataType}:`, data.message);
      return {
        updated: false,
        error: true,
        message: data.message || 'Error data not stored'
      };
    }

    // Check if the data is empty
    if (data && data.empty === true) {
      console.warn(`Empty data received for ${table}/${dataType}`);
      // Store a placeholder to indicate we checked but found no data
      data = { empty: true, checked_at: new Date().toISOString() };
    }

    // Check if record exists for this date
    const checkResult = await client.query(
      `SELECT id FROM ${table} WHERE date = $1`,
      [date]
    );

    if (checkResult.rows.length > 0) {
      // Update existing record
      const id = checkResult.rows[0].id;
      const result = await client.query(
        `UPDATE ${table}
         SET ${dataType}_data = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id`,
        [data, id]
      );
      return { updated: true, id: result.rows[0].id };
    } else {
      // Insert new record
      const insertObj = {};
      insertObj[`${dataType}_data`] = data;

      const result = await client.query(
        `INSERT INTO ${table} (date, ${dataType}_data)
         VALUES ($1, $2)
         RETURNING id`,
        [date, data]
      );
      return { updated: false, id: result.rows[0].id };
    }
  } catch (error) {
    console.error(`Error storing data in ${table}:`, error);
    return {
      error: true,
      message: error.message,
      details: error.stack
    };
  } finally {
    client.release();
  }
}

/**
 * Convert date from DD.MM.YYYY to YYYY-MM-DD format
 * @param {string} dateStr - Date string in DD.MM.YYYY format
 * @returns {string} Date string in YYYY-MM-DD format
 */
function convertDateFormat(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month}-${day}`;
}

module.exports = {
  pool,
  formatDate,
  getYesterdayDate,
  fetchFromGoalServe,
  storeData,
  convertDateFormat
};
