import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Package,
  MessageSquare,
  User,
  Users,
  BarChart3
} from 'lucide-react';
import { useUnreadChats } from '@/hooks/useUnreadChats';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: 'customer' | 'rider' | 'admin';
}

const customerNavItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/chats', label: 'Chats', icon: MessageSquare },
  { path: '/profile', label: 'Profile', icon: User },
];

const riderNavItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/jobs', label: 'Jobs', icon: Package },
  { path: '/chats', label: 'Chats', icon: MessageSquare },
  { path: '/profile', label: 'Profile', icon: User },
];

const adminNavItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export function MainLayout({ children, userRole }: MainLayoutProps) {
  const location = useLocation();
  const { userData } = useAuth();
  const totalUnread = useUnreadChats(userData?.uid, userRole);

  const navItems = userRole === 'customer'
    ? customerNavItems
    : userRole === 'rider'
    ? riderNavItems
    : adminNavItems;

  const activeIndex = navItems.findIndex(item =>
    location.pathname === item.path ||
    (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
  );

  const tabWidth = 100 / navItems.length;

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D8E5EF] z-50 h-16">
        <div className="max-w-[1200px] mx-auto h-full px-4">
          <div className="relative flex items-center h-full">
            {/* Active Indicator - animates left position as percentage */}
            {activeIndex >= 0 && (
              <motion.div
                className="absolute top-0 h-1 bg-[#1188E9] rounded-b-full z-10"
                style={{ width: `${tabWidth}%` }}
                initial={false}
                animate={{ left: `${activeIndex * tabWidth}%` }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              const isChatsTab = item.path === '/chats';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex-1 flex flex-col items-center justify-center h-full relative"
                >
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-[#1188E9]' : 'text-[#4A6375]'
                      }`}
                    />
                    {/* Unread badge on Chats tab */}
                    {isChatsTab && totalUnread > 0 && (
                      <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {totalUnread > 99 ? '99+' : totalUnread}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 transition-colors ${
                      isActive ? 'text-[#1188E9] font-medium' : 'text-[#4A6375]'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}