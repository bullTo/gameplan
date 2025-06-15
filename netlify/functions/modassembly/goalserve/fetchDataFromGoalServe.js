require('dotenv').config();
// Netlify function for processing user prompts
const fetch = require('node-fetch');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { fetchMLBData } = require('./mlb/run');
const { fetchMLSData } = require('./mls/run');
const { fetchGOLFData } = require('./golf/run');
const { fetchF1Data } = require('./f1/run');
const { fetchNBAData } = require('./nba/run');
const { formatMLBData } = require('./mlb/format');
const { formatMLSData } = require('./mls/format');
const { formatGOLFData } = require('./golf/format');
const { formatNBAData } = require('./nba/format');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


exports.handler = async (event) => {
  try {

    // Step 2: Fetch relevant data from GoalServe based on the prompt analysis
    let formattedData;
    switch ((extractedData.sport || '').toLowerCase()) {
      case 'mls':
        const sportsMLSData = await fetchMLSData(extractedData.sport, extractedData);
        formattedData = formatMLSData(sportsMLSData);
        break;
      case 'mlb':
        const sportsMLBData = await fetchMLBData(extractedData.sport, extractedData);
        formattedData = formatMLBData(sportsMLBData);
        break;
      case 'golf':
        const sportsGOLFData = await fetchGOLFData(extractedData.sport, extractedData);
        formattedData = formatGOLFData(sportsGOLFData);
        break;
      case 'f1':
        const sportsF1Data = await fetchF1Data(extractedData.sport, extractedData);
        break;
      case 'nba':
        const sportsNBAData = await fetchNBAData(extractedData.sport, extractedData);
        formattedData = formatNBAData(sportsNBAData);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Unsupported sport: ${extractedData.sport}` }),
          headers: { 'Content-Type': 'application/json' }
        };
    }

    return sportsData;

  } catch (error) {
    console.error('Fetching Data from Goalserver error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

module.exports = {
  fetchDataFromGoalServer,
};
