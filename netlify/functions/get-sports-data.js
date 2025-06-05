// Main function to orchestrate sports data collection
const { getYesterdayDate } = require('./sports-data-utils');
const { updateNflData } = require('./update-nfl-data');
const { updateNbaData } = require('./update-nba-data');
const { updateNhlData } = require('./update-nhl-data');
const { updateMlbData } = require('./update-mlb-data');
// MLS excluded for now due to XML data format issues

// Map of sport codes to update functions
const sportUpdaters = {
  nfl: updateNflData,
  nba: updateNbaData,
  nhl: updateNhlData,
  mlb: updateMlbData
  // mls: updateMlsData - excluded for now
};

// List of all available sports
const allSports = Object.keys(sportUpdaters);

/**
 * Update data for specified sports
 * @param {string} date - Date in DD.MM.YYYY format
 * @param {Array<string>} sports - List of sports to update
 * @returns {Promise<Object>} Results of the update operations
 */
async function updateSportsData(date = null, sports = allSports) {
  const targetDate = date || getYesterdayDate();
  console.log(`Updating data for sports [${sports.join(', ')}] for date ${targetDate}`);

  const results = {};

  // Process each sport
  for (const sport of sports) {
    if (sportUpdaters[sport]) {
      try {
        results[sport] = await sportUpdaters[sport](targetDate);
      } catch (error) {
        console.error(`Error updating ${sport} data:`, error);
        results[sport] = { error: error.message };
      }
    } else {
      results[sport] = { error: 'Invalid sport code' };
    }
  }

  return results;
}

/**
 * Netlify function handler
 */
exports.handler = async (event) => {
  try {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const date = queryParams.date; // Optional date parameter

    // Parse sports parameter (comma-separated list)
    let sports = allSports; // Default to all sports
    if (queryParams.sports) {
      sports = queryParams.sports.split(',').map(s => s.trim().toLowerCase());
    }

    // Validate sports
    sports = sports.filter(sport => allSports.includes(sport));

    if (sports.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No valid sports specified',
          validSports: allSports
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Update data for specified sports
    const results = await updateSportsData(date, sports);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sports data update completed',
        date: date || getYesterdayDate(),
        sports: sports,
        results: results
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error in get-sports-data handler:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to update sports data',
        message: error.message
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
