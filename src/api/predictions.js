// API functions for predictions
import { continuousColorLegendClasses } from '@mui/x-charts';
import { getAuthToken, handleResponse } from './utils';

/**
 * Get predictions for the current user
 * @param {Object} [params={}] - The query parameters
 * @param {string} [params.sport] - Filter by sport
 * @param {string} [params.risk_level] - Filter by risk level
 * @param {string} [params.bet_type] - Filter by bet type
 * @param {number} [params.limit] - Limit the number of results
 * @returns {Promise<any>} The predictions response
 */
// API base URL for serverless functions
const API_BASE_URL = import.meta.env.VITE_APP_DOMAIN || '';
const FUNCTIONS_PATH_PREFIX = import.meta.env.VITE_FUNCTIONS_PATH_PREFIX || '/.netlify/functions';

export async function getPredictions(params = {}) {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.sport) queryParams.append('sport', params.sport);
    if (params.risk_level) queryParams.append('risk_level', params.risk_level);
    if (params.bet_type) queryParams.append('bet_type', params.bet_type);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/get-predictions${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Get predictions error:', error);
    throw error;
  }
}

/**
 * Get a single prediction by ID
 * @param {string|undefined} id - The prediction ID
 * @returns {Promise<any>} The prediction response
 */
export async function getPredictionById(id) {
  try {
    console.log("getPRedictionById");
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/get-prediction-by-id?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Get prediction by ID error:', error);
    throw error;
  }
}
/**
 * Fetch player/team stats from GoalServe via Netlify serverless function.
 * @param {Object} params - The parameters for the stats request.
 * @param {string} params.sport - The sport (e.g., 'mlb', 'nba', etc.)
 * @param {string} [params.player] - The player name (optional)
 * @param {string} [params.team] - The team name (optional)
 * @param {string} [params.opponent] - The opponent name (optional)
 * @returns {Promise<any>} The stats response
 */
export async function fetchGoalServeStats(params = {}) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.sport) queryParams.append('sport', params.sport);
    if (params.player) queryParams.append('player', params.player);
    if (params.team) queryParams.append('team', params.team);
    if (params.opponent) queryParams.append('opponent', params.opponent);

    console.log(params.sport, params.player, params.team, params.opponent)
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(
      `${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/goalserve-stats${queryString}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log("response:", response)
    return handleResponse(response);
  } catch (error) {
    console.error('Fetch GoalServe stats error:', error);
    throw error;
  }
}

