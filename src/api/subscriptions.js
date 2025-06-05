// API client for subscription management

import { getAdminToken } from './admin';

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
 * Get all subscription plans
 * @returns {Promise<any>} The subscription plans
 */
export async function getSubscriptionPlans() {
  try {
    const token = getAdminToken();
    
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await fetch('/.netlify/functions/admin-subscriptions/plans', {
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
 * Create a new subscription plan
 * @param {Object} planData - The plan data
 * @returns {Promise<any>} The created plan
 */
export async function createSubscriptionPlan(planData) {
  try {
    const token = getAdminToken();
    
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await fetch('/.netlify/functions/admin-subscriptions/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Create subscription plan error:', error);
    throw error;
  }
}

/**
 * Update a subscription plan
 * @param {Object} planData - The plan data
 * @returns {Promise<any>} The updated plan
 */
export async function updateSubscriptionPlan(planData) {
  try {
    const token = getAdminToken();
    
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await fetch('/.netlify/functions/admin-subscriptions/plans', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Update subscription plan error:', error);
    throw error;
  }
}

/**
 * Delete a subscription plan
 * @param {number} planId - The plan ID
 * @returns {Promise<any>} The deletion response
 */
export async function deleteSubscriptionPlan(planId) {
  try {
    const token = getAdminToken();
    
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await fetch(`/.netlify/functions/admin-subscriptions/plans?id=${planId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    throw error;
  }
}

/**
 * Get user subscriptions
 * @param {Object} params - The query parameters
 * @param {number} [params.page=1] - The page number
 * @param {number} [params.limit=10] - The number of subscriptions per page
 * @param {string} [params.status=''] - Filter by status
 * @param {string} [params.plan_key=''] - Filter by plan key
 * @param {string} [params.search=''] - Search term for user name or email
 * @returns {Promise<any>} The user subscriptions
 */
export async function getUserSubscriptions(params = {}) {
  try {
    const token = getAdminToken();
    
    if (!token) {
      throw new Error('No admin token found');
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`/.netlify/functions/admin-subscriptions/subscriptions${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    throw error;
  }
}

/**
 * Update a user subscription
 * @param {Object} subscriptionData - The subscription data
 * @param {number} subscriptionData.id - The subscription ID
 * @param {number} [subscriptionData.plan_id] - The new plan ID
 * @param {string} [subscriptionData.status] - The new status
 * @param {string} [subscriptionData.end_date] - The new end date
 * @returns {Promise<any>} The updated subscription
 */
export async function updateUserSubscription(subscriptionData) {
  try {
    const token = getAdminToken();
    
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await fetch('/.netlify/functions/admin-subscriptions/subscriptions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(subscriptionData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Update user subscription error:', error);
    throw error;
  }
}
