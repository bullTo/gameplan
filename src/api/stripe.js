/**
 * API client for Stripe-related functionality
 */
import { handleResponse, getAuthToken } from './utils';

/**
 * Create a checkout session for subscription purchase
 * @param {string} planName - The plan name (e.g., 'pro', 'elite')
 * @param {string} successUrl - URL to redirect to on successful checkout
 * @param {string} cancelUrl - URL to redirect to if checkout is canceled
 * @returns {Promise<{sessionId: string, url: string}>} The checkout session details
 */
export async function createCheckoutSession(planName, successUrl, cancelUrl) {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planName,
        successUrl,
        cancelUrl
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Create checkout session error:', error);
    throw error;
  }
}

/**
 * Redirect to Stripe Checkout
 * @param {string} planName - The plan name (e.g., 'pro', 'elite')
 */
export async function redirectToCheckout(planName) {
  try {
    // Load Stripe.js dynamically
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

    // Get the current URL for success and cancel URLs
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/account/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/account/subscription/cancel`;

    // Create checkout session
    const { sessionId } = await createCheckoutSession(
      planName,
      successUrl,
      cancelUrl
    );

    // Redirect to checkout
    const result = await stripe.redirectToCheckout({
      sessionId
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Redirect to checkout error:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 * @returns {Promise<{success: boolean, subscription: Object}>} The updated subscription
 */
export async function cancelSubscription() {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch('/.netlify/functions/manage-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'cancel'
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
}

/**
 * Reactivate a subscription that was set to cancel at period end
 * @returns {Promise<{success: boolean, subscription: Object}>} The updated subscription
 */
export async function reactivateSubscription() {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch('/.netlify/functions/manage-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'reactivate'
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    throw error;
  }
}

/**
 * Update subscription to a new plan
 * @param {string} priceId - The Stripe price ID for the new plan
 * @returns {Promise<{success: boolean, subscription: Object}>} The updated subscription
 */
export async function updateSubscription(priceId) {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch('/.netlify/functions/manage-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'update',
        priceId
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Update subscription error:', error);
    throw error;
  }
}

/**
 * Create a customer portal session for managing billing
 * @param {string} returnUrl - URL to return to after the portal session
 * @returns {Promise<{url: string}>} The portal session URL
 */
export async function createPortalSession(returnUrl) {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch('/.netlify/functions/manage-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'portal',
        returnUrl
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Create portal session error:', error);
    throw error;
  }
}

/**
 * Redirect to Stripe Customer Portal
 * @param {string} returnUrl - URL to return to after the portal session
 */
export async function redirectToCustomerPortal(returnUrl = window.location.href) {
  try {
    const { url } = await createPortalSession(returnUrl);
    window.location.href = url;
  } catch (error) {
    console.error('Redirect to customer portal error:', error);
    throw error;
  }
}

/**
 * Load Stripe.js dynamically
 * @param {string} publishableKey - Stripe publishable key
 * @returns {Promise<any>} The Stripe.js instance
 */
async function loadStripe(publishableKey) {
  if (window.Stripe) {
    return window.Stripe(publishableKey);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      resolve(window.Stripe(publishableKey));
    };
    script.onerror = () => {
      reject(new Error('Failed to load Stripe.js'));
    };
    document.head.appendChild(script);
  });
}
