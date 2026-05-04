import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Home, 
  Package, 
  MessageSquare, 
  User,
  Users,
  BarChart3
} from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);

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
  const targetLeft = activeIndex >= 0 ? activeIndex * tabWidth : 0;

  // Use motion values for smooth spring animation
  const leftMotion = useMotionValue(targetLeft);
  const springLeft = useSpring(leftMotion, { stiffness: 500, damping: 30 });

  // Update target when activeIndex changes
  useEffect(() => {
    leftMotion.set(targetLeft);
  }, [targetLeft, leftMotion]);

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <main className="pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D8E5EF] z-50 h-16">
        <div className="max-w-[1200px] mx-auto h-full px-4">
          <div ref={containerRef} className="flex items-center h-full relative">
            {/* Active Indicator using useSpring */}
            {activeIndex >= 0 && (
              <motion.div
                className="absolute top-0 h-1 bg-[#1188E9] rounded-b-full"
                style={{ 
                  width: `${tabWidth}%`,
                  left: useTransform(springLeft, (v) => `${v}%`),
                }}
              />
            )}
            
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex-1 flex flex-col items-center justify-center h-full relative"
                >
                  <Icon 
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-[#1188E9]' : 'text-[#4A6375]'
                    }`} 
                  />
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