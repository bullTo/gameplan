import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { redirectToCheckout } from '@/api/stripe';
import { useToast } from '@/components/ui/use-toast';

/**
 * Subscription checkout component
 * Displays subscription plans and allows users to checkout with Stripe
 */
export function SubscriptionCheckout({ plans = [] }) {
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter out free plans and inactive plans
  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase() !== 'free' && plan.is_active
  );

  // Handle subscription checkout
  const handleCheckout = async (planName) => {
    try {
      setLoading(planName);
      await redirectToCheckout(planName.toLowerCase()); // Convert to lowercase to match database
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to start checkout process. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {filteredPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onCheckout={handleCheckout}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual plan card component
 */
function PlanCard({ plan, onCheckout, loading }) {
  const isPro = plan.name.toLowerCase() === 'pro';

  return (
    <Card className={`w-full ${isPro ? 'border-primary' : ''}`}>
      <CardHeader>
        <CardTitle className="text-2xl">
          {plan.name}
          {isPro && (
            <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              Popular
            </span>
          )}
        </CardTitle>
        <CardDescription>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">${plan.price}</span>
            <span className="text-muted-foreground ml-1">/month</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 mr-2 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onCheckout(plan.name)}
          disabled={loading}
          variant={isPro ? 'default' : 'outline'}
        >
          {loading === plan.name ? 'Processing...' : `Subscribe to ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
