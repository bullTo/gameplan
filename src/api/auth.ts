// API client for authentication

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  agreeToTerms: boolean;
}

// Export the type so TypeScript doesn't complain about it being unused
export type AuthResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    subscription_plan: string;
  };
  token: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription_plan?: string;
}

// API base URL for serverless functions
const API_BASE_URL = import.meta.env.VITE_APP_DOMAIN || '';
const FUNCTIONS_PATH_PREFIX = import.meta.env.VITE_FUNCTIONS_PATH_PREFIX || '/.netlify/functions';


// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};


// Login user
export async function loginUser(credentials: LoginCredentials) {
  try {
    
    // For development/testing, use mock data
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
      console.log('Using mock login:', credentials);
      return new Promise((resolve) => {
        setTimeout(() => {
          // Store mock token and user data
          localStorage.setItem('authToken', 'mock-token-123');
          const userData = {
            id: '1',
            name: 'John Doe',
            email: credentials.email,
            role: 'user',
            subscription_plan: 'free'
          };
          localStorage.setItem('userData', JSON.stringify(userData));

          resolve(userData);
        }, 1000);
      });
    }

    // Real API call
    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        ...credentials,
      }),
    });

    const data = await handleResponse(response);

    // Store authentication data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));

    return {
      message: data.message,
      role: 'user'
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Login admin
export async function loginAdmin(credentials: LoginCredentials) {
  // For now, we'll keep the mock implementation for admin login
  console.log('Logging in admin with:', credentials);

  return new Promise((resolve) => {
    setTimeout(() => {
      const userData = {
        id: 'admin1',
        name: 'Admin User',
        email: credentials.email,
        role: 'admin',
      };

      // Store mock token and user data for admin
      localStorage.setItem('authToken', 'mock-admin-token-123');
      localStorage.setItem('userData', JSON.stringify(userData));

      resolve(userData);
    }, 1000);
  });
}

// Register user
export async function registerUser(data: RegisterData) :Promise<{ message: string, role?: any }>{
  try {
    // For development/testing, use mock data
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
      console.log('Using mock registration:', data);
      return new Promise((resolve) => {
        setTimeout(() => {
          // Store mock token and user data
          localStorage.setItem('authToken', 'mock-token-123');
          const userData = {
            message: 'successfully',
            role: 'user',
          };
          localStorage.setItem('userData', JSON.stringify(userData));

          resolve(userData);
        }, 1000);
      });
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = data;

    // Real API call
    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        ...registerData,
      }),
    });

    const responseData = await handleResponse(response);

    return {
      message: responseData.message,
      role: 'user'
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<{ message: string, debug?: any }> {
  try {
    // For development/testing, use mock data
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
      console.log('Using mock password reset request for:', email);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: 'If your email is registered, you will receive a password reset link',
            debug: {
              resetToken: 'mock-reset-token-123',
              resetUrl: '/reset-password?token=mock-reset-token-123'
            }
          });
        }, 1000);
      });
    }

    // Real API call
    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/auth-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'request',
        email,
      }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
}

// Verify reset token
export async function verifyResetToken(token: string): Promise<{ message: string, userId: string }> {
  try {
    // For development/testing, use mock data
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
      console.log('Using mock token verification for:', token);
      return new Promise((resolve) => {
        setTimeout(() => {
          if (token === 'mock-reset-token-123') {
            resolve({
              message: 'Token is valid',
              userId: 'mock-user-123'
            });
          } else {
            throw new Error('Invalid or expired token');
          }
        }, 1000);
      });
    }

    // Real API call
    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/auth-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verify',
        token,
      }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
}

// Reset password with token
export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  try {
    // For development/testing, use mock data
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
      console.log('Using mock password reset for token:', token);
      return new Promise((resolve) => {
        setTimeout(() => {
          if (token === 'mock-reset-token-123') {
            resolve({
              message: 'Password has been reset successfully'
            });
          } else {
            throw new Error('Invalid or expired token');
          }
        }, 1000);
      });
    }

    // Real API call
    const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/auth-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'reset',
        token,
        password,
      }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

// Get authentication token
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Get user data
export function getUserData(): User | null {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

// Logout user
export function logoutUser(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}
