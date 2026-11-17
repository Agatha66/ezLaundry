import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadChats } from '@/hooks/useUnreadChats';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { PageTransition } from '@/components/motion';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ShellContext } from './ShellContext';
import { activeNavPath, type ShellRole } from './navItems';

/** Keeps the outgoing page rendered while it animates out. */
function AnimatedOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

/** Persistent layout for signed-in users: sidebar on desktop, floating tab bar on mobile. */
export function AppShell() {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = (userData?.role ?? 'customer') as ShellRole;
  const unread = useUnreadChats(userData?.uid, role);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const activePath = activeNavPath(role, location.pathname);

  const shell = useMemo(
    () => ({ openNewOrder: () => role === 'customer' && setNewOrderOpen(true) }),
    [role]
  );

  return (
    <ShellContext.Provider value={shell}>
      <div className="min-h-screen bg-background lg:flex">
        <Sidebar role={role} activePath={activePath} unread={unread} />

        <main className="min-w-0 flex-1 px-4 pb-32 sm:px-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">
            <AnimatePresence mode="wait" initial={false}>
              <PageTransition key={location.pathname}>
                <AnimatedOutlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>

        <BottomNav role={role} activePath={activePath} unread={unread} />

        {role === 'customer' && (
          <>
            <motion.button
              onClick={() => setNewOrderOpen(true)}
              aria-label="New order"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5rem)] right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/40 lg:hidden"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
            <CreateOrderDialog
              isOpen={newOrderOpen}
              onClose={() => setNewOrderOpen(false)}
              onOrderCreated={order => {
                toast.success(`Order ${order.id} created`, {
                  description: "We're finding a rider near you.",
                  action: { label: 'Track', onClick: () => navigate(`/order/${order.id}`) },
                });
              }}
            />
          </>
        )}
      </div>
    </ShellContext.Provider>
  );
}
