// API client for prompt processing and tracker functionality

/**
 * Helper function to handle API responses
 * @param {Response} response - The fetch response
 * @returns {Promise<any>} The parsed response data
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
};

/**
 * Get the auth token from localStorage
 * @returns {string|null} The auth token
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Process a user prompt
 * @param {string} prompt - The user's prompt text
 * @returns {Promise<any>} The processed prompt response
 */
export async function processPrompt(prompt) {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/.netlify/functions/prompt-process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt })
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Prompt processing error:', error);
    throw error;
  }
}

/**
 * Save a pick to the tracker
 * @param {Object} pickData - The pick data
 * @param {string} pickData.playText - The text of the play
 * @param {number} [pickData.promptLogId] - The ID of the prompt log
 * @param {string} [pickData.reasoning] - The reasoning for the pick
 * @param {string} [pickData.sport] - The sport
 * @param {string} [pickData.betType] - The bet type
 * @param {any} [pickData.metadata] - Additional metadata
 * @returns {Promise<any>} The saved pick
 */
export async function savePick(pickData) {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/.netlify/functions/tracker-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pickData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Save pick error:', error);
    throw error;
  }
}

/**
 * Get saved picks
 * @param {Object} [params={}] - The query parameters
 * @param {'pending'|'hit'|'miss'} [params.status] - Filter by status
 * @param {string} [params.sport] - Filter by sport
 * @param {number} [params.limit] - Limit the number of results
 * @param {number} [params.offset] - Offset for pagination
 * @returns {Promise<SavedPicksResponse>} The saved picks response
 */
export async function getSavedPicks(params = {}) {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.sport) queryParams.append('sport', params.sport);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`/.netlify/functions/tracker-get${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Get saved picks error:', error);
    throw error;
  }
}

/**
 * Update pick status
 * @param {number} pickId - The ID of the pick
 * @param {'pending'|'hit'|'miss'} status - The new status
 * @returns {Promise<any>} The updated pick
 */
export async function updatePickStatus(pickId, status) {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/.netlify/functions/tracker-update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pickId, status })
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Update pick status error:', error);
    throw error;
  }
}
