import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, type ShellRole } from './navItems';

interface BottomNavProps {
  role: ShellRole;
  activePath: string | null;
  unread: number;
}

/** Floating tab bar for phones and tablets (below lg). */
export function BottomNav({ role, activePath, unread }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex h-16 max-w-md items-center rounded-[22px] border border-border bg-card/85 px-1.5 shadow-lg shadow-black/5 backdrop-blur-xl lg:hidden">
      {NAV_ITEMS[role].map(item => {
        const active = item.path === activePath;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId="tab-blob"
                className="absolute inset-0 rounded-2xl bg-primary/10"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <motion.span
              className="relative"
              animate={{ y: active ? -1 : 0, scale: active ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              <Icon className="h-5 w-5" />
              {item.chat && unread > 0 && (
                <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </motion.span>
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
