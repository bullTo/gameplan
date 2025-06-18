import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface SubscriptionStatus {
  status: string | null;
  subscription_plan: string | null;
  loading: boolean;
  error: string | null;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [subscription_plan, setSubscriptionPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user || !(user as any)?.id) {
          setStatus('inactive');
          setLoading(false);
          return;
        }

        const userData = user as any;

        const response = await fetch(`/.netlify/functions/get-user-status?userId=${userData.id}`, {
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
      } finally {
        setLoading(false);
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