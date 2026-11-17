import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, ChevronRight, Package, Star, Users, Wallet } from 'lucide-react';
import { TopBar } from '@/components/shell/TopBar';
import { CountUp, Stagger, StaggerItem } from '@/components/motion';
import { HomeSkeleton } from '@/components/Skeletons';
import { OrderCard } from '@/components/order/OrderCard';
import { RevenueArea, StatusPie } from '@/components/admin/Charts';
import { useAuth } from '@/contexts/AuthContext';
import { useAllOrders } from '@/hooks/useOrders';
import { authService } from '@/services/authService';
import { dailySeries, riderAverage, statusBreakdown } from '@/lib/reports';
import { toNumber } from '@/lib/dates';
import { isActive } from '@/components/order/orderMeta';
import type { User } from '@/types';

function Kpi({ icon: Icon, tint, label, value, prefix, decimals, hint }: { icon: typeof Package; tint: string; label: string; value: number; prefix?: string; decimals?: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}><Icon className="h-[18px] w-[18px]" /></span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <CountUp value={value} prefix={prefix} decimals={decimals} className="block font-poppins text-2xl font-semibold text-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { orders, loading } = useAllOrders();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    authService.getAllUsers().then(setUsers).catch(e => console.error('Failed to load users', e));
  }, []);

  const series = useMemo(() => dailySeries(orders, 7), [orders]);
  const breakdown = useMemo(() => statusBreakdown(orders), [orders]);
  const weekRevenue = series.reduce((s, d) => s + d.revenue, 0);
  const active = orders.filter(isActive);
  const activeRiders = new Set(active.map(o => o.riderId).filter(Boolean)).size;
  const riders = users.filter(u => u.role === 'rider').length;
  const customers = users.filter(u => u.role === 'customer').length;
  const rating = riderAverage(orders);
  const revenueAll = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + toNumber(o.totalAmount), 0);

  return (
    <>
      <TopBar subtitle="Operations overview" title={`Hello, ${userData?.displayName?.split(' ')[0] ?? 'Admin'}`} />
      {loading ? (
        <HomeSkeleton />
      ) : (
        <Stagger className="space-y-5">
          <StaggerItem className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi icon={Wallet} tint="bg-primary/10 text-primary" label="Revenue (7 days)" value={weekRevenue} prefix="RM" hint={`RM${Math.round(revenueAll).toLocaleString('en-MY')} all-time`} />
            <Kpi icon={Package} tint="bg-teal/15 text-teal" label="Active orders" value={active.length} hint={`${orders.length} total`} />
            <Kpi icon={Bike} tint="bg-amber-500/10 text-amber-600" label="Riders on a job" value={activeRiders} hint={`${riders} riders`} />
            <Kpi icon={Star} tint="bg-violet-500/10 text-violet-600" label={`Avg rating · ${rating.count} reviews`} value={rating.avg} decimals={1} />
          </StaggerItem>

          <StaggerItem className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Revenue this week</h2>
                <button onClick={() => navigate('/reports')} className="flex items-center text-sm font-medium text-primary hover:underline">
                  Reports <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <RevenueArea data={series} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-foreground">Orders by status</h2>
              {breakdown.length ? <StatusPie data={breakdown} height={180} /> : <p className="text-sm text-muted-foreground">No orders yet.</p>}
            </div>
          </StaggerItem>

          <StaggerItem className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h2 className="mb-3 font-semibold text-foreground">Latest orders</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map(o => <OrderCard key={o.id} order={o} showCustomer />)}
                {orders.length === 0 && <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">No orders yet.</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">People</h2>
                <button onClick={() => navigate('/users')} className="flex items-center text-sm font-medium text-primary hover:underline">
                  Manage <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary/10 p-4">
                  <Users className="mb-2 h-5 w-5 text-primary" />
                  <CountUp value={customers} className="block font-poppins text-2xl font-semibold text-foreground" />
                  <p className="text-xs text-muted-foreground">Customers</p>
                </div>
                <div className="rounded-xl bg-teal/10 p-4">
                  <Bike className="mb-2 h-5 w-5 text-teal" />
                  <CountUp value={riders} className="block font-poppins text-2xl font-semibold text-foreground" />
                  <p className="text-xs text-muted-foreground">Riders</p>
                </div>
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      )}
    </>
  );
}
