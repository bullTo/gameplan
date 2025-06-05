import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

/**
 * Subscription cancel page
 * Displayed when a user cancels the Stripe checkout process
 */
export default function SubscriptionCancel() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  // Redirect to subscription page after countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/account/subscription');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, navigate]);
  
  return (
    <div className="container max-w-md py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Checkout Canceled</CardTitle>
          <CardDescription>
            Your subscription checkout was canceled.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            No charges were made to your account. You can try again whenever you're ready.
          </p>
          <p className="mt-4 text-sm">
            Redirecting to subscription page in {countdown} seconds...
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/account/subscription')}>
            Back to Subscription Plans
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
