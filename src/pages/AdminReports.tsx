import { useMemo, useState } from 'react';
import { Download, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/shell/TopBar';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { CountUp, Stagger, StaggerItem } from '@/components/motion';
import { StatsSkeleton, Skeleton } from '@/components/Skeletons';
import { OrdersBar, RevenueArea, StatusPie } from '@/components/admin/Charts';
import { useAllOrders } from '@/hooks/useOrders';
import { dailySeries, ordersToCsv, riderAverage, statusBreakdown } from '@/lib/reports';
import { dayKey, toDate, toNumber } from '@/lib/dates';

type Range = '7' | '30';

function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdminReports() {
  const { orders, loading } = useAllOrders();
  const [range, setRange] = useState<Range>('7');
  const days = Number(range);

  const inRange = useMemo(() => {
    const since = Date.now() - days * 24 * 3600e3;
    return orders.filter(o => (toDate(o.createdAt)?.getTime() ?? 0) >= since);
  }, [orders, days]);
  const series = useMemo(() => dailySeries(orders, days), [orders, days]);
  const breakdown = useMemo(() => statusBreakdown(inRange), [inRange]);

  const revenue = series.reduce((s, d) => s + d.revenue, 0);
  const paidOrders = inRange.filter(o => o.status !== 'cancelled');
  const aov = paidOrders.length ? revenue / paidOrders.length : 0;
  const cancelRate = inRange.length ? (inRange.filter(o => o.status === 'cancelled').length / inRange.length) * 100 : 0;

  const riders = useMemo(() => {
    const map = new Map<string, { name: string; jobs: number; earned: number }>();
    for (const o of inRange) {
      if (!o.riderId) continue;
      const r = map.get(o.riderId) ?? { name: o.riderName ?? 'Rider', jobs: 0, earned: 0 };
      if (o.status === 'completed' || o.status === 'delivered') {
        r.jobs += 1;
        r.earned += toNumber(o.deliveryFee);
      }
      map.set(o.riderId, r);
    }
    return [...map.entries()]
      .map(([id, r]) => ({ id, ...r, rating: riderAverage(orders, id) }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 5);
  }, [inRange, orders]);

  const exportCsv = () => {
    downloadCsv(`ezlaundry-orders-${dayKey(new Date())}.csv`, ordersToCsv(inRange));
    toast.success(`Exported ${inRange.length} orders`);
  };

  return (
    <>
      <TopBar
        title="Reports"
        subtitle={`Last ${days} days`}
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!inRange.length} className="h-10 rounded-xl">
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span>
          </Button>
        }
      />

      <SegmentedTabs value={range} onChange={setRange} className="mb-5" items={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }]} />

      {loading ? (
        <div className="space-y-5"><StatsSkeleton /><Skeleton className="h-72 rounded-2xl" /></div>
      ) : (
        <Stagger key={range} className="space-y-5">
          <StaggerItem className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Revenue', value: revenue, prefix: 'RM' },
              { label: 'Orders', value: inRange.length },
              { label: 'Avg order value', value: aov, prefix: 'RM', decimals: 2 },
              { label: 'Cancellation rate', value: cancelRate, suffix: '%', decimals: 1 },
            ].map(k => (
              <div key={k.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix} decimals={k.decimals} className="block font-poppins text-2xl font-semibold text-foreground" />
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </StaggerItem>

          <StaggerItem className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-foreground"><TrendingUp className="h-4 w-4 text-primary" /> Revenue</h2>
              <RevenueArea data={series} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-2 font-semibold text-foreground">Orders per day</h2>
              <OrdersBar data={series} />
            </div>
          </StaggerItem>

          <StaggerItem className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-foreground">Status breakdown</h2>
              {breakdown.length ? <StatusPie data={breakdown} /> : <p className="text-sm text-muted-foreground">No orders in this period.</p>}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-foreground">Top riders</h2>
              {riders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed jobs in this period.</p>
              ) : (
                <ol className="space-y-3">
                  {riders.map((r, i) => (
                    <li key={r.id} className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-teal to-primary text-sm font-semibold text-white">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.jobs} jobs · RM{r.earned} fees</p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {r.rating.count ? r.rating.avg.toFixed(1) : '–'}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </StaggerItem>
        </Stagger>
      )}
    </>
  );
}
