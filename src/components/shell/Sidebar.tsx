import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { useConfirm } from '@/components/ConfirmDialog';
import { useCustomerOrders } from '@/hooks/useOrders';
import { computeLoyalty } from '@/lib/loyalty';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, type ShellRole } from './navItems';

interface SidebarProps {
  role: ShellRole;
  activePath: string | null;
  unread: number;
}

function LoyaltyMini() {
  const { userData } = useAuth();
  const { orders } = useCustomerOrders(userData?.uid);
  const l = computeLoyalty(orders);
  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy to-[#123E55] p-4 text-white">
      <p className="text-xs text-white/70">ezPoints · {l.tier}</p>
      <p className="font-poppins text-2xl font-semibold">{l.points} pts</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(l.progress * 100)}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-1.5 text-xs text-white/70">{l.nextTier ? `${l.toNext} pts to ${l.nextTier}` : 'Top tier reached'}</p>
    </div>
  );
}

/** Desktop navigation (lg and up). */
export function Sidebar({ role, activePath, unread }: SidebarProps) {
  const { userData, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const confirm = useConfirm();
  const dark = resolvedTheme === 'dark';

  const handleLogout = async () => {
    if (await confirm({ title: 'Log out?', description: 'You can sign back in any time.', confirmText: 'Log out' })) {
      await logout();
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
      <Link to="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-teal font-poppins text-sm font-bold text-white">
          ez
        </span>
        <span className="font-poppins text-lg font-bold text-foreground">ezLaundry</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS[role].map(item => {
          const active = item.path === activePath;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <motion.span
                  layoutId="side-ind"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative h-[18px] w-[18px]" />
              <span className="relative">{item.label}</span>
              {item.chat && unread > 0 && (
                <span className="relative ml-auto rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        {role === 'customer' && <LoyaltyMini />}
        <div className="flex items-center gap-3 rounded-xl px-2 py-1">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-teal text-sm font-semibold text-white">
            {userData?.displayName?.charAt(0)?.toUpperCase() ?? '?'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{userData?.displayName}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{role}</p>
          </div>
          <button
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <motion.span key={dark ? 'moon' : 'sun'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
              {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.span>
          </button>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
