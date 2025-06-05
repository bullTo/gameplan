// Function to update NFL data
const { 
  fetchFromGoalServe, 
  storeData, 
  convertDateFormat,
  getYesterdayDate
} = require('./sports-data-utils');

/**
 * Fetch NFL scores data
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} NFL scores data
 */
async function fetchNflScores(date) {
  try {
    return await fetchFromGoalServe('football/nfl-scores', { date });
  } catch (error) {
    console.error(`Error fetching NFL scores for ${date}:`, error);
    throw error;
  }
}

/**
 * Fetch NFL standings data
 * @returns {Promise<Object>} NFL standings data
 */
async function fetchNflStandings() {
  try {
    return await fetchFromGoalServe('football/nfl-standings');
  } catch (error) {
    console.error('Error fetching NFL standings:', error);
    throw error;
  }
}

/**
 * Fetch NFL schedule data
 * @returns {Promise<Object>} NFL schedule data
 */
async function fetchNflSchedule() {
  try {
    return await fetchFromGoalServe('football/nfl-shedule');
  } catch (error) {
    console.error('Error fetching NFL schedule:', error);
    throw error;
  }
}

/**
 * Update NFL data for a specific date
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} Result of the update operation
 */
async function updateNflData(date = null) {
  // Use provided date or default to yesterday
  const targetDate = date || getYesterdayDate();
  console.log(`Updating NFL data for ${targetDate}`);
  
  // Convert to database date format (YYYY-MM-DD)
  const dbDate = convertDateFormat(targetDate);
  
  const results = {
    date: targetDate,
    scores: { success: false, error: null },
    standings: { success: false, error: null },
    schedule: { success: false, error: null }
  };
  
  // Fetch and store scores data
  try {
    const scoresData = await fetchNflScores(targetDate);
    await storeData('nfl_data', dbDate, 'scores', scoresData);
    results.scores.success = true;
  } catch (error) {
    results.scores.error = error.message;
    console.error(`Failed to update NFL scores for ${targetDate}:`, error);
  }
  
  // Fetch and store standings data
  try {
    const standingsData = await fetchNflStandings();
    await storeData('nfl_data', dbDate, 'standings', standingsData);
    results.standings.success = true;
  } catch (error) {
    results.standings.error = error.message;
    console.error(`Failed to update NFL standings for ${targetDate}:`, error);
  }
  
  // Fetch and store schedule data
  try {
    const scheduleData = await fetchNflSchedule();
    await storeData('nfl_data', dbDate, 'schedule', scheduleData);
    results.schedule.success = true;
  } catch (error) {
    results.schedule.error = error.message;
    console.error(`Failed to update NFL schedule for ${targetDate}:`, error);
  }
  
  return results;
}

// Export the function for use in other files
module.exports = { updateNflData };
