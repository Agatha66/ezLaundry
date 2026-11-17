import { CheckCircle2, Clock, Receipt as ReceiptIcon } from 'lucide-react';
import { toDate } from '@/lib/dates';
import type { Order } from '@/types';
import { SERVICE_NAMES, money } from './orderMeta';

const METHOD: Record<string, string> = { cash: 'Cash', ewallet: 'e-Wallet', card: 'Card' };

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? 'flex justify-between pt-1 text-base font-semibold text-foreground' : 'flex justify-between text-sm'}>
      <span className={strong ? '' : 'text-muted-foreground'}>{label}</span>
      <span className={strong ? 'text-primary' : 'text-foreground'}>{value}</span>
    </div>
  );
}

/** Price breakdown and payment state. */
export function Receipt({ order }: { order: Order }) {
  const paid = order.paymentStatus === 'paid';
  const paidAt = toDate(order.paymentReceivedAt);
  const items = order.finalPrice ?? order.estimatedPrice;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <ReceiptIcon className="h-5 w-5 text-primary" /> Receipt
      </h3>
      <div className="space-y-2">
        <Row label={`${SERVICE_NAMES[order.serviceType]} · ${order.weight || order.estimatedWeight} kg`} value={money(items)} />
        <Row label="Pickup & delivery" value={money(order.deliveryFee)} />
        {order.finalPrice != null && order.finalPrice !== order.estimatedPrice && (
          <Row label="Estimated" value={<s className="text-muted-foreground">{money(order.estimatedPrice)}</s>} />
        )}
        <div className="my-3 border-t border-dashed border-border" />
        <Row label="Total" value={money(order.totalAmount)} strong />
      </div>
      <div className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${paid ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
        {paid ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
        {paid
          ? `Paid · ${METHOD[order.paymentMethod ?? ''] ?? 'Cash'}${paidAt ? ` · ${paidAt.toLocaleString('en-MY', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}` : ''}`
          : `Pay on delivery · ${METHOD[order.paymentMethod ?? ''] ?? 'Cash'}`}
      </div>
    </div>
  );
}
