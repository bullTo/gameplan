// API utility functions

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Set the authentication token in localStorage
 * @param {string} token - The authentication token
 */
export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

/**
 * Remove the authentication token from localStorage
 */
export function removeAuthToken() {
  localStorage.removeItem('authToken');
}

/**
 * Handle the response from an API call
 * @param {Response} response - The fetch response object
 * @returns {Promise<any>} The parsed response data
 * @throws {Error} If the response is not ok
 */
export async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const error = (data && data.error) || response.statusText;
    throw new Error(error);
  }

  return data;
}

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} The formatted date
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get a date range (start and end dates)
 * @param {number} days - Number of days to include in the range
 * @returns {Object} Object with start and end dates
 */
export function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Parse JWT token to get user information
 * @param {string} token - The JWT token
 * @returns {Object|null} The decoded token payload or null if invalid
 */
export function parseToken(token) {
  if (!token) return null;

  try {
    // Split the token and get the middle part (payload)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

/**
 * Get the admin authentication token from localStorage
 * @returns {string|null} The admin authentication token or null if not found
 */
export function getAdminToken() {
  return localStorage.getItem('adminAuthToken');
}
