// API functions for user management
import { getAuthToken, handleResponse } from './utils';

/**
 * Get users with optional filtering
 * @param {Object} [params={}] - The query parameters
 * @param {boolean} [params.subscription_only] - Filter to only show users with active subscriptions
 * @param {number} [params.limit] - Limit the number of results
 * @param {number} [params.offset] - Offset for pagination
 * @returns {Promise<any>} The users response
 */
export async function getUsers(params = {}) {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.subscription_only !== undefined) queryParams.append('subscription_only', params.subscription_only.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(`/.netlify/functions/get-users${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
}
