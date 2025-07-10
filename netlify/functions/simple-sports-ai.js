require('dotenv').config();
// Simple function to fetch sports data and send it directly to Claude 3 Opus
const { Pool } = require('pg');
const fetch = require('node-fetch');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

    // Parse the request body
    const requestBody = JSON.parse(event.body || '{}');
    const { prompt, sport = 'nba' } = requestBody;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };
    }

    console.log(`Processing prompt: "${prompt}" for sport: ${sport}`);

    // Map sport to table name
    const sportTable = `${sport.toLowerCase()}_data`;

    // Fetch data from database
    console.log(`Fetching data from ${sportTable}`);
    const client = await pool.connect();

    try {
      // Get the most recent data for this sport
      const result = await client.query(
        `SELECT date, scores_data, standings_data, schedule_data
         FROM ${sportTable}
         ORDER BY date DESC
         LIMIT 1`
      );

      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: `No data found for ${sport}` }),
          headers: { 'Content-Type': 'application/json' }
        };
      }

      // Get the raw data
      const row = result.rows[0];
      console.log(`Found data for ${sport} from ${row.date}`);

      // Log data sizes to verify we have data
      console.log(`Scores data size: ${JSON.stringify(row.scores_data || {}).length} characters`);
      console.log(`Standings data size: ${JSON.stringify(row.standings_data || {}).length} characters`);
      console.log(`Schedule data size: ${JSON.stringify(row.schedule_data || {}).length} characters`);

      // Prepare the data for Claude 3 Opus - with size limits
      // First, let's extract only what we need from each data type

      // Process scores data - keep only essential game information
      let processedScores = null;
      if (row.scores_data) {
        try {
          // Extract just the key game information
          const scores = row.scores_data;

          // For NBA, NHL, NFL
          if (scores.scores && scores.scores.category && scores.scores.category.match) {
            const matches = Array.isArray(scores.scores.category.match)
              ? scores.scores.category.match
              : [scores.scores.category.match];

            // Keep only the first 5 games and only essential fields
            processedScores = {
              league: sport.toUpperCase(),
              games: matches.slice(0, 5).map(match => ({
                id: match.id,
                date: match.date,
                status: match.status,
                homeTeam: {
                  name: match.hometeam.name,
                  score: match.hometeam.totalscore
                },
                awayTeam: {
                  name: match.awayteam.name,
                  score: match.awayteam.totalscore
                }
              }))
            };
          }
        } catch (e) {
          console.error('Error processing scores data:', e);
          processedScores = { error: 'Failed to process scores data' };
        }
      }

      // Process standings data - keep only essential team information
      let processedStandings = null;
      if (row.standings_data) {
        try {
          // Extract just the key standings information
          const standings = row.standings_data;

          // For all sports, use a generic approach
          if (standings.standings) {
            processedStandings = {
              league: sport.toUpperCase(),
              divisions: []
            };

            // Try to extract divisions or conferences
            const divisionKeys = Object.keys(standings.standings).filter(key =>
              key === 'division' || key === 'conference' || key === 'category');

            if (divisionKeys.length > 0) {
              const divisionKey = divisionKeys[0];
              const divisions = Array.isArray(standings.standings[divisionKey])
                ? standings.standings[divisionKey]
                : [standings.standings[divisionKey]];

              divisions.forEach(division => {
                if (division.team) {
                  const teams = Array.isArray(division.team) ? division.team : [division.team];

                  // Add top 3 teams from each division
                  processedStandings.divisions.push({
                    name: division.name || 'Division',
                    teams: teams.slice(0, 3).map(team => ({
                      name: team.name,
                      wins: team.won || team.wins,
                      losses: team.lost || team.losses,
                      winPct: team.pct || team.winPct
                    }))
                  });
                }
              });
            }
          }
        } catch (e) {
          console.error('Error processing standings data:', e);
          processedStandings = { error: 'Failed to process standings data' };
        }
      }

      // Process schedule data - keep only upcoming games
      let processedSchedule = null;
      if (row.schedule_data) {
        try {
          // Extract just the key schedule information
          const schedule = row.schedule_data;

          // For all sports, use a generic approach
          if (schedule.schedule) {
            // Try to find games array
            let games = [];

            // Look for common game array patterns
            if (schedule.schedule.game) {
              games = Array.isArray(schedule.schedule.game)
                ? schedule.schedule.game
                : [schedule.schedule.game];
            } else if (schedule.schedule.match) {
              games = Array.isArray(schedule.schedule.match)
                ? schedule.schedule.match
                : [schedule.schedule.match];
            }

            // Keep only the next 5 games
            processedSchedule = {
              league: sport.toUpperCase(),
              upcomingGames: games.slice(0, 5).map(game => ({
                date: game.date,
                time: game.time,
                homeTeam: game.hometeam ? game.hometeam.name : game.home_team,
                awayTeam: game.awayteam ? game.awayteam.name : game.away_team,
                venue: game.venue
              }))
            };
          }
        } catch (e) {
          console.error('Error processing schedule data:', e);
          processedSchedule = { error: 'Failed to process schedule data' };
        }
      }

      // Combine the processed data
      const sportsData = {
        date: row.date,
        scores: processedScores,
        standings: processedStandings,
        schedule: processedSchedule
      };

      // Log the processed data sizes
      console.log(`Processed scores data size: ${JSON.stringify(processedScores || {}).length} characters`);
      console.log(`Processed standings data size: ${JSON.stringify(processedStandings || {}).length} characters`);
      console.log(`Processed schedule data size: ${JSON.stringify(processedSchedule || {}).length} characters`);
      console.log(`Total processed data size: ${JSON.stringify(sportsData).length} characters`);

      // Create the messages for Claude 3 Opus
      const messages = [
        {
          role: 'system',
          content: `You are a sports betting assistant specializing in ${sport.toUpperCase()} betting.
          Your task is to analyze the provided sports data and answer the user's question.

          The sports data includes:
          1. Scores - Recent game results
          2. Standings - Current team rankings
          3. Schedule - Upcoming games

          Analyze this data thoroughly to provide informed betting suggestions.`
        },
        {
          role: 'user',
          content: `My question: ${prompt}\n\nHere's the relevant ${sport.toUpperCase()} data:\n${JSON.stringify(sportsData, null, 2)}`
        }
      ];

      console.log(`Sending request to Claude 3 Opus with ${messages.length} messages`);
      console.log(`Total data size: ${JSON.stringify(messages).length} characters`);

      // Send to Claude 3 Opus via OpenRouter
      const baseUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888';
      const response = await fetch(`${baseUrl}/.netlify/functions/openai`, {
        method: 'POST',
        body: JSON.stringify({
          messages,
          use_claude: true,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`Received response from Claude 3 Opus: ${data.message.content.substring(0, 100)}...`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: data.message.content,
          data_sent: true,
          data_sizes: {
            scores: JSON.stringify(row.scores_data || {}).length,
            standings: JSON.stringify(row.standings_data || {}).length,
            schedule: JSON.stringify(row.schedule_data || {}).length
          }
        }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gameplanai.io',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          }
      };

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error processing sports data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process sports data',
        message: error.message,
        stack: error.stack
      }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://gameplanai.io',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };
  }
};
