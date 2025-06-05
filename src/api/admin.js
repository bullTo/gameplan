// API client for admin functionality

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
 * Get the admin auth token from localStorage
 * @returns {string|null} The auth token
 */
const getAdminToken = () => {
  return localStorage.getItem('adminAuthToken');
};

/**
 * Login as admin
 * @param {Object} credentials - The login credentials
 * @param {string} credentials.email - The admin email
 * @param {string} credentials.password - The admin password
 * @returns {Promise<any>} The login response
 */
export async function loginAdmin(credentials) {
  try {
    const response = await fetch('/.netlify/functions/admin-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'login',
        ...credentials
      })
    });

    const data = await handleResponse(response);

    // Store authentication data
    localStorage.setItem('adminAuthToken', data.token);
    localStorage.setItem('adminData', JSON.stringify(data.admin));

    return data;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
}

/**
 * Verify admin token
 * @returns {Promise<any>} The verification response
 */
export async function verifyAdminToken() {
  try {
    const token = getAdminToken();

    if (!token) {
      throw new Error('No admin token found');
    }

    const response = await fetch('/.netlify/functions/admin-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'verify'
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Admin token verification error:', error);
    throw error;
  }
}

/**
 * Logout admin
 */
export function logoutAdmin() {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminData');
}

/**
 * Get admin data from localStorage
 * @returns {Object|null} The admin data
 */
export function getAdminData() {
  const adminData = localStorage.getItem('adminData');
  return adminData ? JSON.parse(adminData) : null;
}

/**
 * Check if admin is authenticated
 * @returns {boolean} Whether admin is authenticated
 */
export function isAdminAuthenticated() {
  return !!getAdminToken();
}

/**
 * Get users with pagination and filtering
 * @param {Object} params - The query parameters
 * @param {number} [params.page=1] - The page number
 * @param {number} [params.limit=10] - The number of users per page
 * @param {string} [params.search=''] - Search term for name or email
 * @param {string} [params.subscription_plan=''] - Filter by subscription plan
 * @param {string} [params.sort_by='created_at'] - Sort by field
 * @param {string} [params.sort_order='desc'] - Sort order (asc or desc)
 * @returns {Promise<any>} The users response
 */
export async function getUsers(params = {}) {
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

/**
 * Create a new user
 * @param {Object} userData - The user data
 * @param {string} userData.name - The user's name
 * @param {string} userData.email - The user's email
 * @param {string} userData.password - The user's password
 * @param {string} [userData.subscription_plan='free'] - The user's subscription plan
 * @returns {Promise<any>} The created user
 */
export async function createUser(userData) {
  try {
    const token = getAdminToken();

    if (!token) {
      throw new Error('No admin token found');
    }

    const response = await fetch('/.netlify/functions/get-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}

/**
 * Update a user
 * @param {Object} userData - The user data
 * @param {number} userData.id - The user ID
 * @param {string} [userData.name] - The user's name
 * @param {string} [userData.email] - The user's email
 * @param {string} [userData.password] - The user's password
 * @param {string} [userData.subscription_plan] - The user's subscription plan
 * @returns {Promise<any>} The updated user
 */
export async function updateUser(userData) {
  try {
    const token = getAdminToken();

    if (!token) {
      throw new Error('No admin token found');
    }

    const response = await fetch('/.netlify/functions/get-users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
}

/**
 * Delete a user
 * @param {number} userId - The user ID
 * @returns {Promise<any>} The deletion response
 */
export async function deleteUser(userId) {
  try {
    const token = getAdminToken();

    if (!token) {
      throw new Error('No admin token found');
    }

    const response = await fetch(`/.netlify/functions/get-users?id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
}

/**
 * Get analytics data
 * @param {string} [period='30d'] - The time period (7d, 30d, 90d, 1y)
 * @returns {Promise<any>} The analytics data
 */
export async function getAnalytics(period = '30d') {
  try {
    const token = getAdminToken();

    if (!token) {
      throw new Error('No admin token found');
    }

    const response = await fetch(`/.netlify/functions/admin-analytics?period=${period}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Get analytics error:', error);
    throw error;
  }
}
