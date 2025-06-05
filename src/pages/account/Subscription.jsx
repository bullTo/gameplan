import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionCheckout } from '@/components/subscription/SubscriptionCheckout';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth.jsx';
import { getSubscriptionPlans, getUserSubscription } from '@/api/plans';

/**
 * Subscription page
 * Shows either subscription checkout or management based on user's subscription status
 */
export default function Subscription() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch subscription plans and user's subscription on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Create an array to hold all promises
        const promises = [];

        // Add promise for fetching plans
        const fetchPlans = async () => {
          try {
            const plansResponse = await getSubscriptionPlans();
            if (plansResponse && plansResponse.plans) {
              setPlans(plansResponse.plans);
            }
            return true;
          } catch (plansError) {
            console.error('Error fetching subscription plans:', plansError);
            toast({
              title: 'Error',
              description: 'Failed to load subscription plans. Please try again.',
              variant: 'destructive'
            });
            return false;
          }
        };

        promises.push(fetchPlans());

        // Add promise for fetching user subscription if logged in
        if (user) {
          const fetchSubscription = async () => {
            try {
              const subscriptionResponse = await getUserSubscription();
              if (subscriptionResponse && subscriptionResponse.subscription) {
                setSubscription(subscriptionResponse.subscription);

                // Set active tab to 'current' if user has a subscription
                setActiveTab('current');
              }
              return true;
            } catch (subscriptionError) {
              console.error('Error fetching user subscription:', subscriptionError);
              // Don't show an error toast here, as the user might not have a subscription yet
              return false;
            }
          };

          promises.push(fetchSubscription());
        }

        // Wait for all promises to resolve
        await Promise.all(promises);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Handle subscription update
  const handleSubscriptionUpdate = (updatedSubscription) => {
    setSubscription(updatedSubscription);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing details
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-[200px]" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <>
          {user && subscription ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="current">Current Subscription</TabsTrigger>
                <TabsTrigger value="plans">Change Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="mt-0">
                <SubscriptionManager
                  subscription={subscription}
                  onUpdate={handleSubscriptionUpdate}
                />
              </TabsContent>

              <TabsContent value="plans" className="mt-0">
                {plans && plans.length > 0 ? (
                  <SubscriptionCheckout plans={plans} />
                ) : (
                  <div className="text-center py-8">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <>
              {plans && plans.length > 0 ? (
                <SubscriptionCheckout plans={plans} />
              ) : (
                <div className="text-center py-8">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              )}
            </>
          )}

          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => navigate('/account/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
