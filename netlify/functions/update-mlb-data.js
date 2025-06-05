// Function to update MLB data
const { 
  fetchFromGoalServe, 
  storeData, 
  convertDateFormat,
  getYesterdayDate
} = require('./sports-data-utils');

/**
 * Fetch MLB scores data
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} MLB scores data
 */
async function fetchMlbScores(date) {
  try {
    return await fetchFromGoalServe('baseball/usa', { date });
  } catch (error) {
    console.error(`Error fetching MLB scores for ${date}:`, error);
    throw error;
  }
}

/**
 * Fetch MLB standings data
 * @returns {Promise<Object>} MLB standings data
 */
async function fetchMlbStandings() {
  try {
    return await fetchFromGoalServe('baseball/mlb_standings');
  } catch (error) {
    console.error('Error fetching MLB standings:', error);
    throw error;
  }
}

/**
 * Fetch MLB schedule data
 * @returns {Promise<Object>} MLB schedule data
 */
async function fetchMlbSchedule() {
  try {
    return await fetchFromGoalServe('baseball/mlb_shedule');
  } catch (error) {
    console.error('Error fetching MLB schedule:', error);
    throw error;
  }
}

/**
 * Update MLB data for a specific date
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} Result of the update operation
 */
async function updateMlbData(date = null) {
  // Use provided date or default to yesterday
  const targetDate = date || getYesterdayDate();
  console.log(`Updating MLB data for ${targetDate}`);
  
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
    const scoresData = await fetchMlbScores(targetDate);
    await storeData('mlb_data', dbDate, 'scores', scoresData);
    results.scores.success = true;
  } catch (error) {
    results.scores.error = error.message;
    console.error(`Failed to update MLB scores for ${targetDate}:`, error);
  }
  
  // Fetch and store standings data
  try {
    const standingsData = await fetchMlbStandings();
    await storeData('mlb_data', dbDate, 'standings', standingsData);
    results.standings.success = true;
  } catch (error) {
    results.standings.error = error.message;
    console.error(`Failed to update MLB standings for ${targetDate}:`, error);
  }
  
  // Fetch and store schedule data
  try {
    const scheduleData = await fetchMlbSchedule();
    await storeData('mlb_data', dbDate, 'schedule', scheduleData);
    results.schedule.success = true;
  } catch (error) {
    results.schedule.error = error.message;
    console.error(`Failed to update MLB schedule for ${targetDate}:`, error);
  }
  
  return results;
}

// Export the function for use in other files
module.exports = { updateMlbData };
