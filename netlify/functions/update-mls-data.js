// Function to update MLS data
const {
  fetchFromGoalServe,
  storeData,
  convertDateFormat,
  getYesterdayDate
} = require('./sports-data-utils');

/**
 * Fetch MLS scores data
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} MLS scores data
 */
async function fetchMlsScores(date) {
  try {
    // MLS data comes in XML format converted to JSON with attributes
    const data = await fetchFromGoalServe('commentaries/1440', { date });

    // Process the data to normalize it
    const processedData = {
      sport: "soccer",
      league: "MLS",
      date: date,
      matches: []
    };

    // Check if we have match data
    if (data && data.commentaries && data.commentaries.tournament && data.commentaries.tournament.match) {
      // Handle both single match and array of matches
      const matches = Array.isArray(data.commentaries.tournament.match)
        ? data.commentaries.tournament.match
        : [data.commentaries.tournament.match];

      // Process each match - EXTREMELY simplified structure WITHOUT raw data
      processedData.matches = matches.map(match => {
        // Extract only the essential match info
        const matchInfo = {
          id: match['@id'],
          date: match['@date'],
          time: match['@time'],
          status: match['@status'] || 'Unknown',

          // Extract minimal team info
          homeTeam: {
            id: match.localteam ? match.localteam['@id'] : null,
            name: match.localteam ? match.localteam['@name'] : 'Home Team',
            score: match.localteam && match.localteam['@goals'] ? match.localteam['@goals'] : '0'
          },

          awayTeam: {
            id: match.visitorteam ? match.visitorteam['@id'] : null,
            name: match.visitorteam ? match.visitorteam['@name'] : 'Away Team',
            score: match.visitorteam && match.visitorteam['@goals'] ? match.visitorteam['@goals'] : '0'
          },

          // Include venue if available
          venue: match.matchinfo && match.matchinfo.stadium ? match.matchinfo.stadium['@name'] : 'Unknown Venue'
        };

        // Add minimal goal information if available
        if (match.summary) {
          const homeGoals = [];
          const awayGoals = [];

          // Process home team goals
          if (match.summary.localteam && match.summary.localteam.goals && match.summary.localteam.goals.player) {
            const goalPlayers = Array.isArray(match.summary.localteam.goals.player)
              ? match.summary.localteam.goals.player
              : [match.summary.localteam.goals.player];

            goalPlayers.forEach(goal => {
              homeGoals.push({
                player: goal['@name'],
                minute: goal['@minute'],
                type: goal['@penalty'] === 'True' ? 'penalty' : 'normal'
              });
            });
          }

          // Process away team goals
          if (match.summary.visitorteam && match.summary.visitorteam.goals && match.summary.visitorteam.goals.player) {
            const goalPlayers = Array.isArray(match.summary.visitorteam.goals.player)
              ? match.summary.visitorteam.goals.player
              : [match.summary.visitorteam.goals.player];

            goalPlayers.forEach(goal => {
              awayGoals.push({
                player: goal['@name'],
                minute: goal['@minute'],
                type: goal['@penalty'] === 'True' ? 'penalty' : 'normal'
              });
            });
          }

          // Only add goals arrays if they have content
          if (homeGoals.length > 0) matchInfo.homeGoals = homeGoals;
          if (awayGoals.length > 0) matchInfo.awayGoals = awayGoals;
        }

        return matchInfo;
      });
    }

    return processedData;
  } catch (error) {
    console.error(`Error fetching MLS scores for ${date}:`, error);
    throw error;
  }
}

/**
 * Fetch MLS standings data
 * @returns {Promise<Object>} MLS standings data
 */
async function fetchMlsStandings() {
  try {
    // MLS standings also come in XML format converted to JSON with attributes
    const data = await fetchFromGoalServe('standings/usa.xml');

    // Process the data to normalize it - simplified version
    const processedData = {
      sport: "soccer",
      league: "MLS",
      date: new Date().toISOString().split('T')[0],
      standings: []
    };

    // Check if we have standings data
    if (data && data.standings && data.standings.category) {
      try {
        const categories = Array.isArray(data.standings.category)
          ? data.standings.category
          : [data.standings.category];

        // Process each category (conference) - limit to top teams only
        categories.forEach(category => {
          if (category.team) {
            const teams = Array.isArray(category.team) ? category.team : [category.team];
            const conferenceName = category['@name'] || 'Unknown';

            // Create a conference object
            const conference = {
              name: conferenceName,
              teams: []
            };

            // Add only the top 10 teams (or fewer if not available)
            const topTeams = teams.slice(0, 10);

            topTeams.forEach(team => {
              conference.teams.push({
                id: team['@id'] || '',
                name: team['@name'] || 'Unknown',
                position: team['@position'] || '',
                points: team['@points'] || '0',
                played: team['@played'] || '0',
                record: `${team['@won'] || '0'}-${team['@drawn'] || '0'}-${team['@lost'] || '0'}`
              });
            });

            processedData.standings.push(conference);
          }
        });
      } catch (error) {
        console.error('Error processing MLS standings:', error);
        processedData.error = error.message;
      }
    }

    return processedData;
  } catch (error) {
    console.error('Error fetching MLS standings:', error);
    throw error;
  }
}

/**
 * Fetch MLS schedule data
 * @returns {Promise<Object>} MLS schedule data
 */
async function fetchMlsSchedule() {
  try {
    // MLS fixtures also come in XML format converted to JSON with attributes
    const data = await fetchFromGoalServe('soccerfixtures/usa/mls');

    // Process the data to normalize it - simplified version
    const processedData = {
      sport: "soccer",
      league: "MLS",
      date: new Date().toISOString().split('T')[0],
      fixtures: []
    };

    // Check if we have fixtures data
    if (data && data.fixtures && data.fixtures.tournament && data.fixtures.tournament.round) {
      try {
        const rounds = Array.isArray(data.fixtures.tournament.round)
          ? data.fixtures.tournament.round
          : [data.fixtures.tournament.round];

        // Get only the next 2 rounds
        const upcomingRounds = rounds.slice(0, 2);

        // Process each round
        upcomingRounds.forEach(round => {
          if (round.match) {
            const matches = Array.isArray(round.match) ? round.match : [round.match];

            // Limit to 10 matches per round
            const limitedMatches = matches.slice(0, 10);

            // Create a round object
            const roundData = {
              name: round['@name'] || 'Unknown Round',
              matches: []
            };

            // Add each match fixture with minimal data
            limitedMatches.forEach(match => {
              roundData.matches.push({
                id: match['@id'] || '',
                date: match['@date'] || '',
                time: match['@time'] || '',
                homeTeam: match.localteam ? match.localteam['@name'] : 'Home Team',
                awayTeam: match.visitorteam ? match.visitorteam['@name'] : 'Away Team'
              });
            });

            processedData.fixtures.push(roundData);
          }
        });
      } catch (error) {
        console.error('Error processing MLS fixtures:', error);
        processedData.error = error.message;
      }
    }

    return processedData;
  } catch (error) {
    console.error('Error fetching MLS schedule:', error);
    throw error;
  }
}

/**
 * Update MLS data for a specific date
 * @param {string} date - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} Result of the update operation
 */
async function updateMlsData(date = null) {
  // Use provided date or default to yesterday
  const targetDate = date || getYesterdayDate();
  console.log(`Updating MLS data for ${targetDate}`);

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
    const scoresData = await fetchMlsScores(targetDate);
    await storeData('mls_data', dbDate, 'scores', scoresData);
    results.scores.success = true;
  } catch (error) {
    results.scores.error = error.message;
    console.error(`Failed to update MLS scores for ${targetDate}:`, error);
  }

  // Fetch and store standings data
  try {
    const standingsData = await fetchMlsStandings();
    await storeData('mls_data', dbDate, 'standings', standingsData);
    results.standings.success = true;
  } catch (error) {
    results.standings.error = error.message;
    console.error(`Failed to update MLS standings for ${targetDate}:`, error);
  }

  // Fetch and store schedule data
  try {
    const scheduleData = await fetchMlsSchedule();
    await storeData('mls_data', dbDate, 'schedule', scheduleData);
    results.schedule.success = true;
  } catch (error) {
    results.schedule.error = error.message;
    console.error(`Failed to update MLS schedule for ${targetDate}:`, error);
  }

  return results;
}

// Export the function for use in other files
module.exports = { updateMlsData };
