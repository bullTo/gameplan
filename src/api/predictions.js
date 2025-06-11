// API functions for predictions
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
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
 * @param {string|number} id - The prediction ID
 * @returns {Promise<any>} The prediction response
 */
export async function getPredictionById(id) {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/get-recommendations?id=${id}`, {
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
