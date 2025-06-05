// Function to update NHL data
const { 
  fetchFromGoalServe, 
  storeData, 
  convertDateFormat,
  getYesterdayDate
} = require('./sports-data-utils');

/**
 * Fetch NHL scores data
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} NHL scores data
 */
async function fetchNhlScores(date) {
  try {
    return await fetchFromGoalServe('hockey/nhl-scores', { date });
  } catch (error) {
    console.error(`Error fetching NHL scores for ${date}:`, error);
    throw error;
  }
}

/**
 * Fetch NHL standings data
 * @returns {Promise<Object>} NHL standings data
 */
async function fetchNhlStandings() {
  try {
    return await fetchFromGoalServe('hockey/nhl-standings');
  } catch (error) {
    console.error('Error fetching NHL standings:', error);
    throw error;
  }
}

/**
 * Fetch NHL schedule data
 * @returns {Promise<Object>} NHL schedule data
 */
async function fetchNhlSchedule() {
  try {
    return await fetchFromGoalServe('hockey/nhl-shedule');
  } catch (error) {
    console.error('Error fetching NHL schedule:', error);
    throw error;
  }
}

/**
 * Update NHL data for a specific date
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} Result of the update operation
 */
async function updateNhlData(date = null) {
  // Use provided date or default to yesterday
  const targetDate = date || getYesterdayDate();
  console.log(`Updating NHL data for ${targetDate}`);
  
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
    const scoresData = await fetchNhlScores(targetDate);
    await storeData('nhl_data', dbDate, 'scores', scoresData);
    results.scores.success = true;
  } catch (error) {
    results.scores.error = error.message;
    console.error(`Failed to update NHL scores for ${targetDate}:`, error);
  }
  
  // Fetch and store standings data
  try {
    const standingsData = await fetchNhlStandings();
    await storeData('nhl_data', dbDate, 'standings', standingsData);
    results.standings.success = true;
  } catch (error) {
    results.standings.error = error.message;
    console.error(`Failed to update NHL standings for ${targetDate}:`, error);
  }
  
  // Fetch and store schedule data
  try {
    const scheduleData = await fetchNhlSchedule();
    await storeData('nhl_data', dbDate, 'schedule', scheduleData);
    results.schedule.success = true;
  } catch (error) {
    results.schedule.error = error.message;
    console.error(`Failed to update NHL schedule for ${targetDate}:`, error);
  }
  
  return results;
}

// Export the function for use in other files
module.exports = { updateNhlData };
