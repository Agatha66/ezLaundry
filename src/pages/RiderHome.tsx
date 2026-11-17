import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bike, CheckCircle2, ChevronRight, Clock, Loader2, MapPin, Package, Star, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/shell/TopBar';
import { CountUp, Stagger, StaggerItem } from '@/components/motion';
import { HomeSkeleton } from '@/components/Skeletons';
import { OrderCard } from '@/components/order/OrderCard';
import { SERVICE_EMOJI, SERVICE_NAMES } from '@/components/order/orderMeta';
import { useAuth } from '@/contexts/AuthContext';
import { useRiderOrders, usePendingOrders } from '@/hooks/useOrders';
import { orderService } from '@/services/orderService';
import { riderAverage } from '@/lib/reports';
import { toDate, toNumber } from '@/lib/dates';
import type { Order } from '@/types';

function Stat({ icon: Icon, tint, label, value, prefix, decimals }: { icon: typeof Package; tint: string; label: string; value: number; prefix?: string; decimals?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ${tint}`}><Icon className="h-[18px] w-[18px]" /></span>
      <CountUp value={value} prefix={prefix} decimals={decimals} className="block font-poppins text-2xl font-semibold text-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function RiderHome() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { activeOrders, completedOrders, loading, refresh: refreshRiderOrders } = useRiderOrders(userData?.uid);
  const { orders: pendingOrders, refresh: refreshPendingOrders } = usePendingOrders();
  const [accepting, setAccepting] = useState<string | null>(null);

  const today = new Date().toDateString();
  const weekAgo = Date.now() - 7 * 24 * 3600e3;
  const doneAt = (o: Order) => toDate(o.completedAt) ?? toDate(o.updatedAt);
  const todayEarnings = completedOrders.filter(o => doneAt(o)?.toDateString() === today).reduce((s, o) => s + toNumber(o.deliveryFee), 0);
  const weekJobs = completedOrders.filter(o => (doneAt(o)?.getTime() ?? 0) >= weekAgo).length;
  const rating = riderAverage(completedOrders);
  const firstName = userData?.displayName?.split(' ')[0] || 'Rider';

  const accept = async (order: Order) => {
    if (!userData) return;
    setAccepting(order.id);
    try {
      await orderService.acceptOrder(order.id, userData.uid, userData.displayName || 'Rider', userData.phone || '');
      await Promise.all([refreshPendingOrders(), refreshRiderOrders()]);
      toast.success(`Job #${order.id.slice(-4)} accepted`, { description: `Pickup at ${order.customerAddress.building}`, action: { label: 'Open', onClick: () => navigate(`/order/${order.id}`) } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not accept this job');
    } finally {
      setAccepting(null);
    }
  };

  return (
    <>
      <TopBar subtitle="Ready to ride? 🛵" title={`Hi, ${firstName}`} />
      {loading ? (
        <HomeSkeleton />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Stagger className="space-y-5">
            <StaggerItem>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal via-[#16676B] to-navy p-5 text-white shadow-xl shadow-teal/25 sm:p-6">
                <span className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-white/10" />
                <div className="relative flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    Online
                  </span>
                  <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                    <Bike className="h-8 w-8" />
                  </motion.span>
                </div>
                {activeOrders[0] ? (
                  <button onClick={() => navigate(`/order/${activeOrders[0].id}`)} className="relative mt-4 block w-full text-left">
                    <p className="text-sm text-white/70">Current job · #{activeOrders[0].id.slice(-4)}</p>
                    <h2 className="font-poppins text-xl font-semibold sm:text-2xl">{activeOrders[0].customerName}</h2>
                    <p className="flex items-center gap-1 text-sm text-white/80"><MapPin className="h-4 w-4" /> {activeOrders[0].customerAddress.building}, {activeOrders[0].customerAddress.area}</p>
                    <span className="mt-4 inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-teal">
                      Continue job <ChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                ) : (
                  <div className="relative mt-4">
                    <h2 className="font-poppins text-xl font-semibold sm:text-2xl">No active job</h2>
                    <p className="text-sm text-white/80">{pendingOrders.length} pickup{pendingOrders.length === 1 ? '' : 's'} waiting nearby.</p>
                  </div>
                )}
              </div>
            </StaggerItem>

            <StaggerItem className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat icon={Wallet} tint="bg-emerald-500/10 text-emerald-600" label="Earned today" value={todayEarnings} prefix="RM" />
              <Stat icon={CheckCircle2} tint="bg-primary/10 text-primary" label="Jobs this week" value={weekJobs} />
              <Stat icon={Package} tint="bg-amber-500/10 text-amber-600" label="In progress" value={activeOrders.length} />
              <Stat icon={Star} tint="bg-violet-500/10 text-violet-600" label={`${rating.count} reviews`} value={rating.avg} decimals={1} />
            </StaggerItem>

            {activeOrders.length > 1 && (
              <StaggerItem>
                <h2 className="mb-3 font-semibold text-foreground">Also in progress</h2>
                <div className="space-y-3">
                  {activeOrders.slice(1, 4).map(o => <OrderCard key={o.id} order={o} showCustomer />)}
                </div>
              </StaggerItem>
            )}
          </Stagger>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Available pickups</h2>
              <button onClick={() => navigate('/jobs')} className="flex items-center text-sm font-medium text-primary hover:underline">
                All jobs <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {pendingOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                <p className="text-sm text-muted-foreground">All caught up. New pickups will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {pendingOrders.slice(0, 5).map((o, i) => (
                    <motion.div
                      key={o.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                      exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
                      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-xl">{SERVICE_EMOJI[o.serviceType]}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-foreground">{o.customerAddress.building}</p>
                          <p className="truncate text-xs text-muted-foreground">{o.customerAddress.area} · {SERVICE_NAMES[o.serviceType]}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" /> {toDate(o.pickupDate)?.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} · <span className="capitalize">{o.preferredTimeSlot}</span> · {o.estimatedWeight} kg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">+RM{o.deliveryFee}</p>
                        </div>
                      </div>
                      <Button onClick={() => accept(o)} disabled={accepting === o.id} className="mt-3 h-10 w-full rounded-xl">
                        {accepting === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept job'}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
