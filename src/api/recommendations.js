// API functions for recommendations
import { getAuthToken, handleResponse } from './utils';

/**
 * Get recommendations for the current user
 * @param {Object} [params={}] - The query parameters
 * @param {string} [params.sport] - Filter by sport
 * @param {string} [params.risk_level] - Filter by risk level
 * @param {number} [params.limit] - Limit the number of results
 * @param {boolean} [params.useMockData] - Whether to use mock data for testing
 * @returns {Promise<any>} The recommendations response
 */
export async function getRecommendations(params = {}) {
  try {
    // For development/testing, use mock data if requested or if no token is available
    const token = getAuthToken();
    const useMockData = params.useMockData || !token;

    if (useMockData) {
      console.log('Using mock recommendations data for testing');
      return getMockRecommendations(params);
    }

    if (!token) {
      throw new Error('Authentication required');
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.sport) queryParams.append('sport', params.sport);
    if (params.risk_level) queryParams.append('risk_level', params.risk_level);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(`/.netlify/functions/get-recommendations${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Get recommendations error:', error);
    throw error;
  }
}

/**
 * Get mock recommendations for testing
 * @param {Object} params - The query parameters
 * @returns {Promise<any>} The mock recommendations response
 */
function getMockRecommendations(params = {}) {
  // Create mock recommendations for each sport
  const mockRecommendations = [];
  const sports = ['NBA', 'NFL', 'NHL', 'MLB', 'CFL', 'MLS'];
  const riskLevels = ['Safe Bet', 'Moderate', 'Hail Mary'];
  const betTypes = ['moneyline', 'spread', 'over/under', 'prop', 'parlay'];

  // Generate 3 recommendations per sport (one for each risk level)
  sports.forEach(sport => {
    riskLevels.forEach((riskLevel, index) => {
      const betType = betTypes[index % betTypes.length];

      // Create a mock recommendation
      mockRecommendations.push({
        id: mockRecommendations.length + 1,
        user_id: 1,
        sport: sport,
        bet_type: betType,
        description: `${sport} ${betType} recommendation for ${riskLevel} risk level`,
        team_or_player: `Team A vs Team B`,
        opponent: 'Team B',
        line: betType === 'moneyline' ? 'ML' : betType === 'spread' ? '-3.5' : 'O 220.5',
        odds: '+120',
        confidence: riskLevel === 'Safe Bet' ? 85 : riskLevel === 'Moderate' ? 65 : 45,
        match_date: new Date().toISOString(),
        risk_level: riskLevel,
        reasoning: `This is a mock ${riskLevel.toLowerCase()} recommendation for testing purposes.`,
        created_at: new Date().toISOString()
      });
    });
  });

  // Filter by sport if specified
  let filteredRecommendations = mockRecommendations;
  if (params.sport) {
    filteredRecommendations = filteredRecommendations.filter(rec =>
      rec.sport.toLowerCase() === params.sport.toLowerCase()
    );
  }

  // Filter by risk level if specified
  if (params.risk_level) {
    filteredRecommendations = filteredRecommendations.filter(rec =>
      rec.risk_level.toLowerCase() === params.risk_level.toLowerCase()
    );
  }

  // Limit the number of results if specified
  const limit = params.limit || 9;
  filteredRecommendations = filteredRecommendations.slice(0, limit);

  // Return the mock recommendations
  return {
    recommendations: filteredRecommendations
  };
}

/**
 * Manually trigger recommendation generation
 * @returns {Promise<any>} The generation response
 */
export async function generateRecommendations() {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/.netlify/functions/generate-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Generate recommendations error:', error);
    throw error;
  }
}
