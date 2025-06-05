import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminLogin from '../pages/management/Login';
import AdminDashboard from '../pages/management/Dashboard';
import AdminUsers from '../pages/management/Users';
import { isAdminAuthenticated } from '@/api/admin';

// Placeholder for Analytics page
const Analytics = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Analytics</h1>
    <p>Analytics dashboard coming soon.</p>
  </div>
);

const ManagementLayout = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="/"
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/management" replace />} />
    </Routes>
  );
}

// Auth wrapper component
function RequireAdminAuth({ children }: { children: JSX.Element }) {
  const isAuthenticated = isAdminAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/management/login" replace />;
  }

  return children;
}

export default ManagementLayout
