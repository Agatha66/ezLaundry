import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayPoint } from '@/lib/reports';

const PRIMARY = 'hsl(var(--primary))';
const TEAL = 'hsl(var(--teal))';
const GRID = 'hsl(var(--border))';
const MUTED = 'hsl(var(--muted-foreground))';

const PIE_COLORS = ['#1188E9', '#1A7A7E', '#F59E0B', '#7C3AED', '#16A34A', '#EF4444', '#0EA5E9', '#EC4899', '#64748B'];

function ChartTooltip({ active, payload, label, prefix = '' }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string; prefix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-muted-foreground">
          {prefix}{p.value.toLocaleString('en-MY')} {p.name === 'orders' ? 'orders' : ''}
        </p>
      ))}
    </div>
  );
}

export function RevenueArea({ data, height = 220 }: { data: DayPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
        <YAxis tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
        <Tooltip content={<ChartTooltip prefix="RM" />} cursor={{ stroke: GRID }} />
        <Area type="monotone" dataKey="revenue" stroke={PRIMARY} strokeWidth={2.5} fill="url(#rev)" animationDuration={900} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersBar({ data, height = 220 }: { data: DayPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
        <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
        <Bar dataKey="orders" fill={TEAL} radius={[6, 6, 2, 2]} animationDuration={900} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPie({ data, height = 220, stacked = false }: { data: { label: string; count: number }[]; height?: number; stacked?: boolean }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className={`flex flex-col items-center gap-4 ${stacked ? "" : "sm:flex-row"}`}>
      <div className="relative w-full max-w-[220px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="label" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none" animationDuration={900}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">{payload[0].name}: {String(payload[0].value)}</div>
            ) : null} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-poppins text-2xl font-semibold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">orders</span>
        </div>
      </div>
      <ul className="grid w-full flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="flex-1 truncate text-muted-foreground">{d.label}</span>
            <span className="font-medium text-foreground">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
