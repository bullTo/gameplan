import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cancelSubscription, reactivateSubscription, redirectToCustomerPortal } from '@/api/stripe';
import { useToast } from '@/components/ui/use-toast';

/**
 * Subscription manager component
 * Displays current subscription details and allows users to manage their subscription
 */
export function SubscriptionManager({ subscription, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { toast } = useToast();

  if (!subscription) {
    return (
      <Alert>
        <AlertTitle>No active subscription</AlertTitle>
        <AlertDescription>
          You don't have an active subscription. Subscribe to a plan to access premium features.
        </AlertDescription>
      </Alert>
    );
  }

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Not available';
    }

    try {
      let date;

      // Check if it's a number (Unix timestamp)
      if (typeof dateValue === 'number') {
        date = new Date(dateValue * 1000);
      }
      // Check if it's a string (ISO date or PostgreSQL timestamp)
      else if (typeof dateValue === 'string') {
        // Try to parse the date string
        date = new Date(dateValue);
      }
      else {
        return 'Invalid date format';
      }

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date value:', dateValue);
        return 'Invalid date';
      }

      // Format the date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Invalid date';
    }
  };

  // Handle subscription cancellation
  const handleCancel = async () => {
    try {
      setLoading(true);
      const result = await cancelSubscription();

      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription has been canceled and will end at the current billing period.',
      });

      setCancelDialogOpen(false);

      if (onUpdate) {
        onUpdate(result.subscription);
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle subscription reactivation
  const handleReactivate = async () => {
    try {
      setLoading(true);
      const result = await reactivateSubscription();

      toast({
        title: 'Subscription Reactivated',
        description: 'Your subscription has been reactivated successfully.',
      });

      if (onUpdate) {
        onUpdate(result.subscription);
      }
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reactivate subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle redirect to customer portal
  const handleManageBilling = async () => {
    try {
      setLoading(true);
      await redirectToCustomerPortal();
    } catch (error) {
      console.error('Manage billing error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to open billing portal. Please try again.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Your Subscription</CardTitle>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>
        <CardDescription>
          Manage your subscription and billing details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Plan</h4>
            <p className="text-lg font-medium">{subscription.plan}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Billing Cycle</h4>
            <p className="text-lg font-medium">{subscription.interval}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              {subscription.status === 'canceled' || subscription.cancel_at_period_end ?
                'Subscription End Date' :
                'Next Billing Date'
              }
            </h4>
            <p className="text-lg font-medium">{formatDate(subscription.next_billing_date)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
            <p className="text-lg font-medium">${(subscription.amount / 100).toFixed(2)}</p>
          </div>
        </div>

        {subscription.cancel_at_period_end && (
          <Alert variant="warning">
            <AlertTitle>Subscription Ending</AlertTitle>
            <AlertDescription>
              {subscription.next_billing_date ?
                `Your subscription is set to cancel on ${formatDate(subscription.next_billing_date)}.` :
                'Your subscription is set to cancel at the end of the current billing period.'
              }
              You can reactivate your subscription to continue your access.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleManageBilling}
          disabled={loading}
        >
          Manage Billing
        </Button>

        {subscription.cancel_at_period_end ? (
          <Button
            onClick={handleReactivate}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reactivate Subscription'}
          </Button>
        ) : (
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                Cancel Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Subscription</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel your subscription?
                  {subscription.next_billing_date ?
                    ` You'll continue to have access until the end of your current billing period on ${formatDate(subscription.next_billing_date)}.` :
                    ' You\'ll continue to have access until the end of your current billing period.'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={loading}
                >
                  Keep Subscription
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Cancellation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Subscription status badge component
 */
function SubscriptionStatusBadge({ status }) {
  let variant = 'default';
  let label = status;

  switch (status) {
    case 'active':
      variant = 'success';
      label = 'Active';
      break;
    case 'trialing':
      variant = 'info';
      label = 'Trial';
      break;
    case 'past_due':
      variant = 'warning';
      label = 'Past Due';
      break;
    case 'canceled':
      variant = 'destructive';
      label = 'Canceled';
      break;
    default:
      variant = 'secondary';
  }

  return (
    <Badge variant={variant}>{label}</Badge>
  );
}
