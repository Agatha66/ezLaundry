import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationBell';
import { useShell } from './ShellContext';

interface TopBarProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Shows a back button; a string is the path to go to, `true` goes back in history. */
  back?: boolean | string;
  actions?: React.ReactNode;
}

/** Sticky page header used by every page inside the app shell. */
export function TopBar({ title, subtitle, back, actions }: TopBarProps) {
  const { userData } = useAuth();
  const { openNewOrder } = useShell();
  const navigate = useNavigate();
  const role = userData?.role;

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 bg-background/80 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 lg:pt-6">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
            aria-label="Back"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-card shadow-sm transition-transform hover:bg-muted active:scale-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          <h1 className="truncate font-poppins text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {role === 'customer' && (
            <Button onClick={openNewOrder} className="hidden h-10 rounded-xl px-4 shadow-md shadow-primary/30 lg:inline-flex">
              <Plus className="h-4 w-4" /> New order
            </Button>
          )}
          {role !== 'admin' && <NotificationBell />}
        </div>
      </div>
    </header>
  );
}
