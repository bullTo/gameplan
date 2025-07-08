import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AccountLayout from './layouts/AccountLayout'
import ManagementLayout from './layouts/ManagementLayout'
import LandingPage from './pages/landingpage/LandingPage'
import { Toaster } from './components/ui/use-toast'
import VerifyEmailPage from './pages/VerifyEmailPage'
// import { useAuth } from './hooks/useAuth'

function App() {
  // function RequireAuth({ children }: { children: JSX.Element }) {
  //   const { isAuthenticated } = useAuth(); // Replace with your actual auth hook/context
  //   const location = useLocation();
  //   const allowedPaths = ['/login', '/reset-password'];

  //   if (!isAuthenticated && !allowedPaths.includes(location.pathname)) {
  //     return <Navigate to="/login" replace />;
  //   }
  //   return children;
  // }
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<HomePage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/account/*"
          element={
            <AccountLayout />
          }
        />
        <Route
          path="/management/*"
          element={
            <ManagementLayout />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
