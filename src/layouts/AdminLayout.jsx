import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart,
  CreditCard,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAdminAuthenticated, logoutAdmin, getAdminData } from '@/api/admin';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Just load admin data, authentication is handled by the parent component
    setAdminData(getAdminData());
    setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/management/login');
  };

  return (
    <div className="min-h-screen bg-[#072730] text-white flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#1B1C25] p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/gameplan-ai-logo.png"
            alt="GamePlan AI Logo"
            className="h-8 mr-2"
          />
          <span className="font-bold">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
            bg-[#1B1C25] w-64 flex-shrink-0 border-r border-[#0EADAB]/20
            fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="p-4 border-b border-[#0EADAB]/20 hidden md:flex items-center">
            <img
              src="/gameplan-ai-logo.png"
              alt="GamePlan AI Logo"
              className="h-8 mr-2"
            />

          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <NavLink to="/management/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              </li>
              <li>
                <NavLink to="/management/users" icon={<Users size={20} />} label="Users" />
              </li>
              <li>
                <NavLink to="/management/analytics" icon={<BarChart size={20} />} label="Analytics" />
              </li>
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#0EADAB]/20">
            {adminData && (
              <div className="mb-4 text-sm">
                <div className="font-medium">{adminData.name}</div>
                <div className="text-gray-400">{adminData.email}</div>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Navigation Link Component
function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center p-2 rounded-md hover:bg-[#0EADAB]/10 transition-colors"
    >
      <span className="mr-3 text-[#0EADAB]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
