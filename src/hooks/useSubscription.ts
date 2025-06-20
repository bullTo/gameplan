import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface SubscriptionStatus {
  status: string | null;
  subscription_plan: string | null;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = import.meta.env.VITE_APP_DOMAIN || '';
const FUNCTIONS_PATH_PREFIX = import.meta.env.VITE_FUNCTIONS_PATH_PREFIX || '/.netlify/functions';


export const useSubscription = (): SubscriptionStatus => {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [subscription_plan, setSubscriptionPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setError(null);

        // if (!user || !(user as any)?.id) {
        //   setStatus('inactive');
        //   return;
        // }

        const userData = user as any;

        const response = await fetch(`${API_BASE_URL}${FUNCTIONS_PATH_PREFIX}/get-user-status?userId=${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        console.log("response", response)
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setSubscriptionPlan(data.subscription_plan);
        } else {
          setError('Failed to fetch subscription status');
          setStatus('inactive');
        }
      } catch (err) {
        console.error('Error fetching subscription status:', err);
        setError('Error fetching subscription status');
        setStatus('inactive');
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  return {
    status,
    subscription_plan,
    loading,
    error
  };
}; 