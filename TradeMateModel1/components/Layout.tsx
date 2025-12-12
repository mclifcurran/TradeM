import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = db.getCurrentUser();

  const handleLogout = () => {
    db.logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'ph-house' },
    { name: 'Upload', path: '/upload', icon: 'ph-plus-circle' },
    { name: 'History', path: '/history', icon: 'ph-list-dashes' },
    { name: 'Settings', path: '/settings', icon: 'ph-gear' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      {/* Top Header - Desktop/Tablet optimized */}
      <header className="bg-navy-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
              <i className="ph-fill ph-wrench text-brand-500 text-2xl"></i>
              <h1 className="text-xl font-bold tracking-tight">Trade<span className="text-brand-500">Mate</span></h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
             <span className="hidden md:inline text-sm text-gray-300">
                {user.email} {user.isPro && <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded ml-1">PRO</span>}
             </span>
             <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition text-sm font-bold"
             >
                <span>Exit</span>
                <i className="ph-bold ph-sign-out"></i>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-brand-600' : 'text-gray-500 hover:text-navy-900'
                }`}
              >
                <i className={`ph ${isActive ? 'ph-fill' : ''} ${item.icon} text-2xl`}></i>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;