/**
 * API functions for subscription plans
 */
import { handleResponse, getAuthToken } from './utils';

/**
 * Get available subscription plans
 * @returns {Promise<Array>} Array of subscription plans
 */
export async function getSubscriptionPlans() {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const response = await fetch('/.netlify/functions/subscription-plans', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Get subscription plans error:', error);
    throw error;
  }
}

/**
 * Get user's current subscription
 * @returns {Promise<Object>} User's subscription details
 */
export async function getUserSubscription() {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const response = await fetch('/.netlify/functions/user-subscription', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Get user subscription error:', error);
    throw error;
  }
}
