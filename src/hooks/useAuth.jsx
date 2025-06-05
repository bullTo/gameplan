import { useState, useEffect, createContext, useContext } from 'react';
import { getAuthToken, removeAuthToken, parseToken } from '@/api/utils';

// Create a context for authentication
const AuthContext = createContext(null);

/**
 * AuthProvider component to wrap the application with authentication context
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        setLoading(true);
        
        // Check if we have a token
        const token = getAuthToken();
        
        if (!token) {
          setUser(null);
          return;
        }
        
        // Parse the token to get user data
        const tokenData = parseToken(token);
        
        if (!tokenData || !tokenData.sub) {
          // Invalid token
          removeAuthToken();
          setUser(null);
          return;
        }
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (tokenData.exp && tokenData.exp < currentTime) {
          // Token is expired
          removeAuthToken();
          setUser(null);
          return;
        }
        
        // Get user data from localStorage
        const storedUserData = localStorage.getItem('userData');
        
        if (storedUserData) {
          setUser(JSON.parse(storedUserData));
        } else {
          // If we have a token but no user data, set minimal user data from token
          setUser({
            id: tokenData.sub,
            email: tokenData.email,
            role: tokenData.role || 'user'
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
    
    // Set up event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update user data in localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    } else {
      localStorage.removeItem('userData');
    }
  }, [user]);

  // Provide the authentication context
  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    logout: () => {
      removeAuthToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
