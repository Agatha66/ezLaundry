import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/shell/TopBar';
import { useShell } from '@/components/shell/ShellContext';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { ListSkeleton } from '@/components/Skeletons';
import { OrderCard } from '@/components/order/OrderCard';
import { RateRiderModal } from '@/components/order/RateRiderModal';
import { DONE_STATUSES, isActive } from '@/components/order/orderMeta';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders } from '@/hooks/useOrders';
import type { Order } from '@/types';

type Filter = 'active' | 'completed' | 'cancelled';

const EMPTY: Record<Filter, string> = {
  active: 'No active orders right now.',
  completed: 'Completed orders will appear here.',
  cancelled: 'No cancelled orders. Nice!',
};

export function Orders() {
  const { userData } = useAuth();
  const { openNewOrder } = useShell();
  const { orders, loading, refresh } = useCustomerOrders(userData?.uid);
  const [filter, setFilter] = useState<Filter>('active');
  const [rating, setRating] = useState<Order | null>(null);

  const groups: Record<Filter, Order[]> = {
    active: orders.filter(isActive),
    completed: orders.filter(o => DONE_STATUSES.includes(o.status)),
    cancelled: orders.filter(o => o.status === 'cancelled'),
  };
  const list = groups[filter];

  return (
    <>
      <TopBar title="My orders" subtitle={`${orders.length} total`} />

      <SegmentedTabs
        value={filter}
        onChange={setFilter}
        className="mb-5"
        items={[
          { value: 'active', label: 'Active', count: groups.active.length },
          { value: 'completed', label: 'Completed', count: groups.completed.length },
          { value: 'cancelled', label: 'Cancelled', count: groups.cancelled.length },
        ]}
      />

      {loading ? (
        <ListSkeleton rows={4} />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={filter}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {list.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
                <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">{EMPTY[filter]}</p>
                {filter === 'active' && (
                  <Button onClick={openNewOrder} className="mt-5 rounded-xl">
                    <Plus className="h-4 w-4" /> New order
                  </Button>
                )}
              </div>
            ) : (
              <motion.div layout className="grid gap-3 md:grid-cols-2">
                <AnimatePresence initial={false}>
                  {list.map((o, i) => (
                    <motion.div
                      key={o.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 10) * 0.04 } }}
                      exit={{ opacity: 0, scale: 0.96 }}
                    >
                      <OrderCard order={o} onRate={setRating} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <RateRiderModal order={rating} onOpenChange={o => !o && setRating(null)} onRated={refresh} />
    </>
  );
}
