/**
 * API functions for subscription plans
 */
import { handleResponse, getAuthToken } from './utils';



// API base URL for serverless functions
const API_BASE_URL = import.meta.env.VITE_APP_DOMAIN || '';
const FUNCTIONS_PATH_PREFIX = import.meta.env.VITE_FUNCTIONS_PATH_PREFIX || '/.netlify/functions';

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
    
    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/subscription-plans`, {
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
    
    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/user-subscription`, {
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
