import { Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, Gift, Lock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserData, logoutUser } from '@/api/auth'
import Footer from '@/components/Footer'
import SubscriptionGuard from '@/components/SubscriptionGuard'
import { useSubscription } from '@/hooks/useSubscription'
import { useToast } from '@/components/ui/use-toast'

// Import page components
import Dashboard from '@/pages/account/Dashboard'
import Predictions from '@/pages/account/Predictions'
import PredictionDetail from '@/pages/account/PredictionDetail'
import Tracker from '@/pages/account/Tracker'
import Profile from '@/pages/account/Profile'
import Settings from '@/pages/account/Settings'
import Referral from '@/pages/account/Referral'
import Account from '@/pages/account/Account'
import Subscription from '@/pages/account/Subscription'
import SubscriptionSuccess from '@/pages/account/SubscriptionSuccess'
import SubscriptionCancel from '@/pages/account/SubscriptionCancel'


const AccountLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { status: userStatus } = useSubscription()

  // Helper function to check if a menu item is active
  const isActive = (path: string) => {
    return location.pathname === path
  }

  // Helper function to check if user has access to premium features
  const hasPremiumAccess = () => {
    return userStatus === 'active';
  }

  const handleLogout = () => {
    // Implement logout functionality
    logoutUser()
    navigate('/')
  }

  const handlePremiumNavigation = (path: string) => {
    console.log(hasPremiumAccess())
    if (hasPremiumAccess()) {
      navigate(path);
    } else {
      // Redirect to subscription page for premium features
      if (path.includes('/predictions') || path.includes('/tracker')) {
        toast({
          title: "Premium Feature Required",
          description: "This feature requires an active subscription. Redirecting to subscription page...",
          variant: "destructive",
        });
        navigate('/account/subscription');
      } else {
        // For non-premium features like dashboard, allow access
        navigate(path);
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#072730' }}>
      <header style={{
        backgroundColor: '#1B1C25',
        borderBottom: '1px solid rgba(14, 173, 171, 0.2)'
      }}>
        <div className="mx-auto max-w-7xl px-12 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              <img
                src="/gameplan-ai-logo.png"
                alt="GamePlan AI Logo"
                style={{ height: '40px', width: 'auto' }}
              />
            </div>
          </div>
          <nav className="flex items-center space-x-6">
            <Button
              variant="ghost"
              onClick={() => handlePremiumNavigation('/account/dashboard')}
              className="flex items-center px-3 py-2 text-base"
              style={{
                color: isActive('/account/dashboard') ? '#0EADAB' : 'white',
                fontWeight: isActive('/account/dashboard') ? 'bold' : 'normal',
                textDecoration: isActive('/account/dashboard') ? 'underline' : 'none',
                letterSpacing: '1.4px',
                fontFamily: 'Poppins'
              }}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => handlePremiumNavigation('/account/predictions')}
              className="flex items-center px-3 py-2 text-base"
              style={{
                color: isActive('/account/predictions') ? '#0EADAB' : 'white',
                fontWeight: isActive('/account/predictions') ? 'bold' : 'normal',
                letterSpacing: '1.4px',
                fontFamily: 'Poppins'
              }}
            >
              Predictions
              {!hasPremiumAccess() && (
                <Lock size={12} className="ml-1 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => handlePremiumNavigation('/account/tracker')}
              className="flex items-center px-3 py-2 text-base"
              style={{
                color: isActive('/account/tracker') ? '#0EADAB' : 'white',
                fontWeight: isActive('/account/tracker') ? 'bold' : 'normal',
                letterSpacing: '1.4px',
                fontFamily: 'Poppins'
              }}
            >
              Tracker
              {!hasPremiumAccess() && (
                <Lock size={12} className="ml-1 text-gray-400" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 text-base"
                  style={{
                    color: isActive('/account/account') ? '#0EADAB' : 'white',
                    fontWeight: isActive('/account/account') ? 'bold' : 'normal',
                    letterSpacing: '1.4px',
                    fontFamily: 'Poppins'
                  }}
                >
                  <span>{getUserData()?.name || 'My Account'}</span>
                  <ChevronDown size={14} style={{ transform: 'rotate(90deg)' }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent style={{ backgroundColor: '#1B1C25', borderRadius: '8px', borderColor: 'rgba(14, 173, 171, 0.2)' }}>
                <DropdownMenuItem
                  onClick={() => navigate('/account/account')}
                  style={{
                    fontFamily: 'Poppins',
                    color: 'white',
                    backgroundColor: '#1B1C25'
                  }}
                  className="hover:bg-[#0EADAB]/10 focus:bg-[#0EADAB]/10"
                >
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/account/subscription')}
                  style={{
                    fontFamily: 'Poppins',
                    color: 'white',
                    backgroundColor: '#1B1C25'
                  }}
                  className="hover:bg-[#0EADAB]/10 focus:bg-[#0EADAB]/10"
                >
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  style={{
                    fontFamily: 'Poppins',
                    color: 'white',
                    backgroundColor: '#1B1C25'
                  }}
                  className="hover:bg-[#0EADAB]/10 focus:bg-[#0EADAB]/10"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              onClick={() => navigate('/account/referral')}
              className="flex items-center px-3 py-2"
              style={{
                color: isActive('/account/referral') ? '#0EADAB' : 'white',
                fontFamily: 'Poppins'
              }}
            >
              <Gift size={16} />
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-base"
              style={{
                color: 'white',
                letterSpacing: '1.4px',
                fontFamily: 'Poppins'
              }}
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" style={{ color: 'white' }}>
        <Routes>
          <Route path="dashboard" element={
              <Dashboard />
          } />
          <Route path="predictions" element={
            <SubscriptionGuard requiredStatus="active">
              <Predictions />
            </SubscriptionGuard>
          } />
          <Route path="predictions/:id" element={
            <SubscriptionGuard requiredStatus="active">
              <PredictionDetail />
            </SubscriptionGuard>
          } />
          <Route path="tracker" element={
            <SubscriptionGuard requiredStatus="active">
              <Tracker />
            </SubscriptionGuard>
          } />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="referral" element={<Referral />} />
          <Route path="account" element={<Account />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="subscription/success" element={<SubscriptionSuccess />} />
          <Route path="subscription/cancel" element={<SubscriptionCancel />} />
          <Route path="*" element={<Navigate to="/account/dashboard" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer variant="account" />
    </div>
  )
}

export default AccountLayout
