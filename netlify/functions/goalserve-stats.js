const { fetchMLBData } = require('./modassembly/goalserve/mlb/run');
const { fetchMLSData } = require('./modassembly/goalserve/mls/run');
const { fetchGOLFData } = require('./modassembly/goalserve/golf/run');
const { fetchCFLData } = require('./modassembly/goalserve/f1/run');
const { fetchNHLData } = require('./modassembly/goalserve/nhl/run');
const { fetchNBAData } = require('./modassembly/goalserve/nba/run');
const { formatMLBData } = require('./modassembly/goalserve/mlb/format');
const { formatMLSData } = require('./modassembly/goalserve/mls/format');
const { formatGOLFData } = require('./modassembly/goalserve/golf/format');
const { formatNBAData } = require('./modassembly/goalserve/nba/format');
const { formatCFLData } = require('./modassembly/goalserve/f1/format');
// Helper to fetch raw stats from GoalServe
async function fetchGoalServeRaw({ sport, player, team, opponent }) {
    // Example: build the correct GoalServe URL for your sport and team/player
    // You must adjust this logic to match your GoalServe feed structure!
    let sportsData;
    const extractedData = {
        sport: sport,
        date1: null,
        date2: null,
        team_name: team,
        player_name: player,
        opponent: opponent
    }

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
        case 'cfl':
            const sportsCFLData = await fetchCFLData(extractedData.sport, extractedData);
            formattedData = formatCFLData(sportsCFLData);
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

    console.log("formattedData:::", formattedData)
    return formattedData;
}

// Helper to summarize stats using OpenAI
async function summarizeStatsWithOpenAI(stats, { sport, player, team, opponent }) {
    const baseUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888';

    const response = await fetch(`${baseUrl}/.netlify/functions/openai`, {
        method: 'POST',
        body: JSON.stringify({
            use_claude: false,  // Use OpenAI
            messages: [
                {
                    role: 'system',
                    content: `
You are a sports betting assistant specializing in ${sport} betting. Given the following raw stats JSON for ${sport.toUpperCase()} and the player/team "${player || team}", extract:
- Season average (PTS+AST or relevant stat)
- Last 5 games average (PTS+AST or relevant stat)
- Average vs opponent (${opponent})
- Game-by-game breakdown (date, opponent, pts, ast, pts+ast, result)
- Additional analysis (1-2 sentences)

Respond in this JSON format:
For example
{
  "season_average": "27.8" (only number),
  "last_5_games": "29.4" (only number),
  "vs_opponent": "31.2" (only number),
  "game_breakdown": [
    { "date": "...", "opponent": "...", "pts": "...", "ast": "...", "pts_ast": "...", "result": "Over/Under ✓/✗" }
  ],
  "additional_analysis": "..."
}
`
                },
                {
                    role: 'user',
                    content: `Here's the relevant sports data: \n${JSON.stringify(stats, null, 2)}`
                }
            ]
        })
    });

    const data = await response.json();
    if (!data.message) {
        throw new Error('Failed to analyze prompt');
    }
    // Extract JSON from OpenAI response
    const text = data.message.content;
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(text.substring(firstBrace, lastBrace + 1));
        } catch (e) {
            return { error: 'Failed to parse OpenAI response', raw: text };
        }
    }
    return { error: 'No JSON found in OpenAI response', raw: text };
}


exports.handler = async (event) => {
  // 🔧 Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://gameplanai.io',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }
    try {
        const { sport, player, team, opponent } = event.queryStringParameters || {};

        if (!sport || (!player && !team)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required parameters' }),
            };
        }

        // 1. Fetch raw stats from GoalServe
        const stats = await fetchGoalServeRaw({ sport, player, team, opponent });

        // 2. Summarize/format with OpenAI
        const summary = await summarizeStatsWithOpenAI(stats, { sport, player, team, opponent });

        return {
            statusCode: 200,
            body: JSON.stringify(summary),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        console.error('GoalServe stats error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};