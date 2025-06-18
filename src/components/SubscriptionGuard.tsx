import React from 'react';
// import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredStatus?: 'active' | 'trial' | 'any';
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  requiredStatus = 'active' 
}) => {
  // const location = useLocation();
  const { status: userStatus, loading } = useSubscription();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0EADAB]"></div>
      </div>
    );
  }

  // Check if user has required subscription status
  const hasAccess = userStatus === requiredStatus || 
                   (requiredStatus === 'any' && userStatus !== 'inactive') ||
                   userStatus === 'active';

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#072730' }}>
        <Card className="w-full max-w-md" style={{ backgroundColor: '#1B1C25', borderColor: 'rgba(14, 173, 171, 0.2)' }}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0EADAB]/10">
              <Lock className="h-6 w-6 text-[#0EADAB]" />
            </div>
            <CardTitle className="text-white">Premium Feature</CardTitle>
            <CardDescription className="text-gray-400">
              This feature requires an active subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-300 text-sm">
              <p>Your current status: <span className="text-red-400 font-semibold">{userStatus || 'inactive'}</span></p>
              <p className="mt-2">Upgrade to access predictions, detailed analysis, and advanced tracking features.</p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-[#0EADAB] hover:bg-[#0EADAB]/90 text-white"
                onClick={() => window.location.href = '/account/subscription'}
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-[#0EADAB] text-[#0EADAB] hover:bg-[#0EADAB]/10"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard; 