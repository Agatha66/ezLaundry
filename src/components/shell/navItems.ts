import { BarChart3, Home, MessageSquare, Package, Truck, User, Users, type LucideIcon } from 'lucide-react';

export type ShellRole = 'customer' | 'rider' | 'admin';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Shows the unread-chat badge. */
  chat?: boolean;
}

export const NAV_ITEMS: Record<ShellRole, NavItem[]> = {
  customer: [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/orders', label: 'Orders', icon: Package },
    { path: '/chats', label: 'Chats', icon: MessageSquare, chat: true },
    { path: '/profile', label: 'Profile', icon: User },
  ],
  rider: [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/jobs', label: 'Jobs', icon: Truck },
    { path: '/chats', label: 'Chats', icon: MessageSquare, chat: true },
    { path: '/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: User },
  ],
};

/** Which nav item a pathname belongs to (detail pages map to their list). */
export function activeNavPath(role: ShellRole, pathname: string): string | null {
  if (pathname.startsWith('/order/')) return role === 'rider' ? '/jobs' : '/orders';
  if (pathname.startsWith('/user/')) return '/users';
  const match = NAV_ITEMS[role].find(i => pathname === i.path || (i.path !== '/dashboard' && pathname.startsWith(i.path)));
  return match?.path ?? null;
}
