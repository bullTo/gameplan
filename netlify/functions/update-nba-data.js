// Function to update NBA data
const { 
  fetchFromGoalServe, 
  storeData, 
  convertDateFormat,
  getYesterdayDate
} = require('./sports-data-utils');

/**
 * Fetch NBA scores data
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} NBA scores data
 */
async function fetchNbaScores(date) {
  try {
    return await fetchFromGoalServe('bsktbl/nba-scores', { date });
  } catch (error) {
    console.error(`Error fetching NBA scores for ${date}:`, error);
    throw error;
  }
}

/**
 * Fetch NBA standings data
 * @returns {Promise<Object>} NBA standings data
 */
async function fetchNbaStandings() {
  try {
    return await fetchFromGoalServe('bsktbl/nba-standings');
  } catch (error) {
    console.error('Error fetching NBA standings:', error);
    throw error;
  }
}

/**
 * Fetch NBA schedule data
 * @returns {Promise<Object>} NBA schedule data
 */
async function fetchNbaSchedule() {
  try {
    return await fetchFromGoalServe('bsktbl/nba-shedule');
  } catch (error) {
    console.error('Error fetching NBA schedule:', error);
    throw error;
  }
}

/**
 * Update NBA data for a specific date
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} Result of the update operation
 */
async function updateNbaData(date = null) {
  // Use provided date or default to yesterday
  const targetDate = date || getYesterdayDate();
  console.log(`Updating NBA data for ${targetDate}`);
  
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
    const scoresData = await fetchNbaScores(targetDate);
    await storeData('nba_data', dbDate, 'scores', scoresData);
    results.scores.success = true;
  } catch (error) {
    results.scores.error = error.message;
    console.error(`Failed to update NBA scores for ${targetDate}:`, error);
  }
  
  // Fetch and store standings data
  try {
    const standingsData = await fetchNbaStandings();
    await storeData('nba_data', dbDate, 'standings', standingsData);
    results.standings.success = true;
  } catch (error) {
    results.standings.error = error.message;
    console.error(`Failed to update NBA standings for ${targetDate}:`, error);
  }
  
  // Fetch and store schedule data
  try {
    const scheduleData = await fetchNbaSchedule();
    await storeData('nba_data', dbDate, 'schedule', scheduleData);
    results.schedule.success = true;
  } catch (error) {
    results.schedule.error = error.message;
    console.error(`Failed to update NBA schedule for ${targetDate}:`, error);
  }
  
  return results;
}

// Export the function for use in other files
module.exports = { updateNbaData };
