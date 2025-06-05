import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSubscriptionPlan } from '@/api/subscription';
import { getUserData } from '@/api/auth';
import { Loader2 } from 'lucide-react';

export function UpgradeSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const userData = getUserData();

  const handleUpgrade = async (plan) => {
    if (!userData || !userData.email) {
      setError('User data not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateSubscriptionPlan(userData.email, plan);
      setSuccess(true);
      // Reload the page after a short delay to reflect the changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to upgrade subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upgrade Your Subscription</CardTitle>
        <CardDescription>
          Upgrade to access more features and higher limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Current Plan</h3>
              <p className="text-sm text-muted-foreground">
                {userData?.subscription_plan || 'free'}
              </p>
            </div>
            {userData?.subscription_plan !== 'free' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpgrade('free')}
                disabled={loading || userData?.subscription_plan === 'free'}
              >
                Downgrade to Free
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm">
              Subscription updated successfully! Reloading page...
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          className="w-full"
          onClick={() => handleUpgrade('core')}
          disabled={loading || userData?.subscription_plan === 'core'}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Upgrading...
            </>
          ) : (
            'Upgrade to Core Plan'
          )}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => handleUpgrade('pro')}
          disabled={loading || userData?.subscription_plan === 'pro'}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Upgrading...
            </>
          ) : (
            'Upgrade to Pro Plan'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
