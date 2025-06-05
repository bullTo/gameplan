// API client for subscription management

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
 * Update user subscription plan
 * @param {string} email - The user's email
 * @param {string} plan - The subscription plan (free, core, pro)
 * @returns {Promise<any>} The updated user data and token
 */
export async function updateSubscriptionPlan(email, plan) {
  try {
    const response = await fetch('/.netlify/functions/update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, plan })
    });
    
    const data = await handleResponse(response);
    
    // Update the stored token and user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
}
