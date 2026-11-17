import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/dates';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { items, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-40" />
                <span className="relative">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[min(340px,calc(100vw-24px))] rounded-2xl p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <BellOff className="h-6 w-6" />
            No updates yet
          </div>
        ) : (
          <ul className="max-h-[360px] overflow-y-auto">
            {items.map((n, i) => (
              <motion.li
                key={n.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0, transition: { delay: Math.min(i, 8) * 0.03 } }}
              >
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate(`/order/${n.orderId}`);
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl p-2.5 text-left text-sm transition-colors hover:bg-muted',
                    n.unread && 'bg-primary/5'
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-base">{n.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{n.title}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(n.at)}</span>
                  </span>
                  {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
