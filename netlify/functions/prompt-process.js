// Netlify function for processing user prompts
const fetch = require('node-fetch');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { fetchMLBData } = require('./modassembly/goalserve/mlb/run');
const { formatData } = require('./modassembly/goalserve/mlb/format');
const { extractDataFromQuery } = require('./modassembly/openai/extract-from-query');
const { generatePredictions } = require('./modassembly/openai/generate-predictions');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Daily prompt limits by subscription plan
// Increased limits for development
const PROMPT_LIMITS = {
  'free': 20,  // Increased from 3 for development
  'core': 30,  // Increased from 15 for development
  'pro': 50    // Increased from 30 for development
};

exports.handler = async (event) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Verify authentication
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authentication required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Verify JWT token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.sub;
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Parse request body
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    console.log(`Processing prompt for user ${userId}: ${prompt}`);

    // Check user's subscription and prompt usage
    const user = await getUserSubscription(userId);

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const promptLimit = 100;

    // Check if user has reached their daily prompt limit
    if (user.daily_prompt_count >= promptLimit) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Daily prompt limit reached',
          limit: promptLimit,
          used: user.daily_prompt_count
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Step 1: Parse the prompt with OpenAI to extract relevant information
    const extractedData = await extractDataFromQuery(prompt);

    // Step 2: Fetch relevant data from GoalServe based on the prompt analysis
    const sportsData = await fetchMLBData(extractedData.sport, extractedData);

    // Step 3: Filter sports data based on the extracted data
    const formattedData = formatData(sportsData);

    // Step 4: Generate predictions using OpenAI
    const predictionsText = await generatePredictions(prompt, extractedData, formattedData);

    // Step 5: Log the prompt and response
    const promptLogId = await logPrompt(userId, prompt, predictionsText, extractedData);

    // Step 5: Increment the user's daily prompt count
    await incrementPromptCount(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        response: predictionsText.content,
        promptAnalysis: extractedData,
        promptLogId,
        remainingPrompts: promptLimit - (user.daily_prompt_count + 1)
      }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error) {
    console.error('Prompt processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process prompt' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

// Get user subscription details
async function getUserSubscription(userId) {
  try {
    // Check if prompt_count_reset_date column exists
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'prompt_count_reset_date'
      );
    `);

    if (!columnExists.rows[0].exists) {
      // Add the column if it doesn't exist
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS daily_prompt_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS prompt_count_reset_date DATE DEFAULT CURRENT_DATE;
      `);
    }

    const result = await pool.query(
      `SELECT id, subscription_plan, daily_prompt_count, prompt_count_reset_date
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Check if we need to reset the daily prompt count
    const today = new Date().toISOString().split('T')[0];
    if (!user.prompt_count_reset_date || user.prompt_count_reset_date.toISOString().split('T')[0] !== today) {
      await pool.query(
        `UPDATE users SET daily_prompt_count = 0, prompt_count_reset_date = $1
         WHERE id = $2`,
        [today, userId]
      );
      user.daily_prompt_count = 0;
      user.prompt_count_reset_date = today;
    }

    return user;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
}

// Transform database game records into a format similar to GoalServe API
function transformGamesToScheduleFormat(sportPrefix, games) {
  console.log(`🔄 Transforming ${games.length} ${sportPrefix} games to schedule format`);

  // Create a structure similar to what the GoalServe API returns
  const scheduleData = {
    scores: {
      category: {
        match: []
      }
    }
  };

  // Transform each game
  games.forEach(game => {
    // Extract basic game info
    const match = {
      id: game.event_id,
      date: formatDateForDisplay(game.start_date),
      time: game.start_time,
      status: game.status,
      league: game.league,
      hometeam: {
        name: game.home_team,
        totalscore: game.home_score.toString(),
      },
      awayteam: {
        name: game.away_team,
        totalscore: game.away_score.toString(),
      }
    };

    // Add quarter/period scores if available in stats
    if (game.stats && Array.isArray(game.stats)) {
      // Process home team quarter/period scores
      for (let i = 1; i <= 4; i++) {
        const periodStat = game.stats.find(s => s.stat_name === `q${i}` || s.stat_name === `period${i}`);
        if (periodStat) {
          match.hometeam[`q${i}`] = periodStat.home_value;
          match.awayteam[`q${i}`] = periodStat.away_value;
        }
      }

      // Add other stats
      match.stats = {};
      game.stats.forEach(stat => {
        if (stat.stat_name && stat.stat_name !== 'ITeam') {
          match.stats[stat.stat_name] = {
            home: stat.home_value,
            away: stat.away_value
          };
        }
      });
    }

    // Add player stats if available in the raw data
    if (game.raw_data && typeof game.raw_data === 'object') {
      try {
        // If player stats exist in the raw data, include them
        if (game.raw_data.player_stats) {
          match.player_stats = game.raw_data.player_stats;
        }
      } catch (e) {
        console.warn(`⚠️ Error processing raw data for game ${game.id}: ${e.message}`);
      }
    }

    // Add the match to the schedule
    scheduleData.scores.category.match.push(match);
  });

  return scheduleData;
}

// Helper function to format date for display
function formatDateForDisplay(dateObj) {
  if (!dateObj) return '';

  // If it's already a string, try to parse it
  if (typeof dateObj === 'string') {
    try {
      dateObj = new Date(dateObj);
    } catch (e) {
      return dateObj; // Return as is if parsing fails
    }
  }

  // Format as DD.MM.YYYY
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}.${month}.${year}`;
}

// Log the prompt and response to the database
async function logPrompt(userId, promptText, response, parsedEntities) {
  try {
    // Insert the prompt log
    // Extract sport and bet_type from parsed entities with correct case handling
    const sport = parsedEntities.Sport || parsedEntities.sport || null;
    const betType = parsedEntities["Bet type"] || parsedEntities.bet_type || null;

    console.log(`📝 Logging prompt with sport: ${sport}, bet_type: ${betType}`);

    const result = await pool.query(
      `INSERT INTO prompt_logs (user_id, prompt_text, response, created_at, sport, bet_type, parsed_entities)
       VALUES ($1, $2, $3, NOW(), $4, $5, $6)
       RETURNING id`,
      [
        userId,
        promptText,
        response.content,
        sport,
        betType,
        JSON.stringify(parsedEntities)
      ]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error('Error logging prompt:', error);
    // Continue even if logging fails
    return null;
  }
}

// Increment the user's daily prompt count
async function incrementPromptCount(userId) {
  try {
    console.log("increment_daily_prompt_count::", userId)
    await pool.query(
      `UPDATE users SET daily_prompt_count = daily_prompt_count + 1
       WHERE id = $1`,
      [userId]
    );
  } catch (error) {
    console.error('Error incrementing prompt count:', error);
    // Continue even if update fails
  }
}

// Helper function to prepare JSON data for the LLM
function truncateJsonForOpenAI(data) {
  try {
    console.log('🔍 Preparing sports data for Claude 3 Opus');

    // With Claude 3 Opus, we can send the processed data directly
    // No need for additional processing since we've already filtered it

    // Add a summary of what data is available
    const organizedData = { ...data };

    organizedData.data_summary = {
      date: data.date,
      has_scores_data: !!data.scores && !data.scores.error,
      has_standings_data: !!data.standings && !data.standings.error,
      has_schedule_data: !!data.schedule && !data.schedule.error
    };

    // Add game counts if available
    if (data.scores && data.scores.games) {
      organizedData.data_summary.games_count = data.scores.games.length;
    }

    // Add division counts if available
    if (data.standings && data.standings.divisions) {
      organizedData.data_summary.divisions_count = data.standings.divisions.length;
    }

    // Add upcoming games count if available
    if (data.schedule && data.schedule.upcomingGames) {
      organizedData.data_summary.upcoming_games_count = data.schedule.upcomingGames.length;
    }

    // If there was an error, include it
    if (data.error) {
      organizedData.error = data.error;
    }

    // Convert to string with pretty formatting
    const jsonString = JSON.stringify(organizedData, null, 2);

    // Log the data size for monitoring
    console.log(`📊 Sports data prepared for Claude 3 Opus (${jsonString.length} characters)`);

    return jsonString;
  } catch (error) {
    console.error('Error preparing sports data:', error);
    return JSON.stringify({ error: 'Failed to process sports data' });
  }
}

// Helper function to extract top players from a match
function extractTopPlayers(match) {
  const topPlayers = {
    home: [],
    away: []
  };

  try {
    // Extract home team top players
    if (match.player_stats && match.player_stats.hometeam && match.player_stats.hometeam.starters) {
      const homePlayers = Array.isArray(match.player_stats.hometeam.starters.player)
        ? match.player_stats.hometeam.starters.player
        : [match.player_stats.hometeam.starters.player];

      // Sort by points and take top 2
      const sortedHomePlayers = homePlayers
        .sort((a, b) => parseInt(b.points || 0) - parseInt(a.points || 0))
        .slice(0, 2);

      // Extract only essential stats
      topPlayers.home = sortedHomePlayers.map(player => ({
        name: player.name,
        points: player.points,
        rebounds: player.total_rebounds,
        assists: player.assists
      }));
    }

    // Extract away team top players
    if (match.player_stats && match.player_stats.awayteam && match.player_stats.awayteam.starters) {
      const awayPlayers = Array.isArray(match.player_stats.awayteam.starters.player)
        ? match.player_stats.awayteam.starters.player
        : [match.player_stats.awayteam.starters.player];

      // Sort by points and take top 2
      const sortedAwayPlayers = awayPlayers
        .sort((a, b) => parseInt(b.points || 0) - parseInt(a.points || 0))
        .slice(0, 2);

      // Extract only essential stats
      topPlayers.away = sortedAwayPlayers.map(player => ({
        name: player.name,
        points: player.points,
        rebounds: player.total_rebounds,
        assists: player.assists
      }));
    }
  } catch (error) {
    console.error('Error extracting top players:', error);
  }

  return topPlayers;
}