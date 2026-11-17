import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, MapPin, MessageCircle, Package, Plus, Sparkles, Star, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/shell/TopBar';
import { useShell } from '@/components/shell/ShellContext';
import { CountUp, Pressable, Stagger, StaggerItem } from '@/components/motion';
import { HomeSkeleton } from '@/components/Skeletons';
import { ActiveOrderHero } from '@/components/order/ActiveOrderHero';
import { OrderCard } from '@/components/order/OrderCard';
import { RateRiderModal } from '@/components/order/RateRiderModal';
import { DONE_STATUSES, isActive } from '@/components/order/orderMeta';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders } from '@/hooks/useOrders';
import { computeLoyalty } from '@/lib/loyalty';
import { toNumber } from '@/lib/dates';
import type { Order } from '@/types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning ☀️';
  if (h < 18) return 'Good afternoon 🌤️';
  return 'Good evening 🌙';
}

function StatCard({ icon: Icon, tint, label, value, prefix }: { icon: typeof Package; tint: string; label: string; value: number; prefix?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ${tint}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <CountUp value={value} prefix={prefix} className="block font-poppins text-2xl font-semibold text-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function CustomerHome() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { openNewOrder } = useShell();
  const { orders, loading, refresh } = useCustomerOrders(userData?.uid);
  const [rating, setRating] = useState<Order | null>(null);

  const active = orders.filter(isActive);
  const done = orders.filter(o => DONE_STATUSES.includes(o.status));
  const spent = done.reduce((sum, o) => sum + toNumber(o.totalAmount), 0);
  const loyalty = computeLoyalty(orders);
  const firstName = userData?.displayName?.split(' ')[0] || 'there';

  const quickActions = [
    { label: 'New order', icon: Plus, tint: 'bg-primary', onClick: openNewOrder },
    { label: 'My orders', icon: Package, tint: 'bg-teal', onClick: () => navigate('/orders') },
    { label: 'Messages', icon: MessageCircle, tint: 'bg-navy', onClick: () => navigate('/chats') },
    { label: 'Addresses', icon: MapPin, tint: 'bg-violet-600', onClick: () => navigate('/profile#addresses') },
  ];

  return (
    <>
      <TopBar subtitle={greeting()} title={`Hi, ${firstName} 👋`} />

      {loading ? (
        <HomeSkeleton />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Stagger className="space-y-5">
            <StaggerItem>
              {active[0] ? (
                <ActiveOrderHero order={active[0]} extra={active.length - 1} />
              ) : (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal to-primary p-6 text-white shadow-xl shadow-primary/20">
                  <Sparkles className="absolute -right-4 -top-4 h-28 w-28 text-white/10" />
                  <p className="text-sm text-white/75">No active orders</p>
                  <h2 className="mt-1 font-poppins text-2xl font-semibold">Laundry day? We've got it.</h2>
                  <p className="mt-1 text-sm text-white/80">Pickup at your door, back fresh in 48 hours.</p>
                  <Button onClick={openNewOrder} className="mt-5 rounded-xl bg-white text-primary hover:bg-white/90">
                    <Plus className="h-4 w-4" /> Schedule a pickup
                  </Button>
                </div>
              )}
            </StaggerItem>

            <StaggerItem className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard icon={Package} tint="bg-primary/10 text-primary" label="Active orders" value={active.length} />
              <StatCard icon={CheckCircle2} tint="bg-emerald-500/10 text-emerald-600" label="Completed" value={done.length} />
              <StatCard icon={Wallet} tint="bg-amber-500/10 text-amber-600" label="Total spent" value={spent} prefix="RM" />
              <StatCard icon={Star} tint="bg-violet-500/10 text-violet-600" label={`${loyalty.tier} points`} value={loyalty.points} />
            </StaggerItem>

            <StaggerItem className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {quickActions.map(a => (
                <Pressable
                  key={a.label}
                  onClick={a.onClick}
                  role="button"
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-1 py-3.5 text-center shadow-sm"
                >
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl text-white ${a.tint}`}>
                    <a.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium text-foreground sm:text-xs">{a.label}</span>
                </Pressable>
              ))}
            </StaggerItem>
          </Stagger>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Recent orders</h2>
              {orders.length > 0 && (
                <button onClick={() => navigate('/orders')} className="flex items-center text-sm font-medium text-primary hover:underline">
                  See all <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Your orders will show up here.</p>
              </div>
            ) : (
              <Stagger className="space-y-3">
                {orders.slice(0, 4).map(o => (
                  <StaggerItem key={o.id}>
                    <OrderCard order={o} onRate={setRating} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>
        </div>
      )}

      <RateRiderModal order={rating} onOpenChange={o => !o && setRating(null)} onRated={refresh} />
    </>
  );
}
