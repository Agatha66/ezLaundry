import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Camera, Clock, FileText, Loader2, MapPin, MessageCircle, Package, Phone, Star, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/shell/TopBar';
import { Stagger, StaggerItem } from '@/components/motion';
import { Skeleton } from '@/components/Skeletons';
import { useConfirm } from '@/components/ConfirmDialog';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { Receipt } from '@/components/order/Receipt';
import { RateRiderModal } from '@/components/order/RateRiderModal';
import { CHAT_STATUSES, SERVICE_EMOJI, SERVICE_NAMES, canRate, trackIndex, TRACK_STEPS } from '@/components/order/orderMeta';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { statusLabels } from '@/lib/orderStatus';
import { formatAddress } from '@/lib/addresses';
import { toDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

function Card({ title, icon: Icon, children, className }: { title?: string; icon?: typeof Package; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5 shadow-sm', className)}>
      {title && (
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          {Icon && <Icon className="h-5 w-5 text-primary" />} {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Person({ name, phone, label }: { name: string; phone?: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-pink-400 font-poppins text-lg font-semibold text-white">
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-semibold text-foreground">{name}</p>
        {phone && <p className="text-sm text-muted-foreground">{phone}</p>}
      </div>
      {phone && (
        <a href={`tel:${phone}`} aria-label={`Call ${name}`} className="grid h-10 w-10 place-items-center rounded-xl border border-border text-primary transition-colors hover:bg-primary/10">
          <Phone className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { userData } = useAuth();
  const confirm = useConfirm();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    orderService
      .getOrder(orderId)
      .then(o => { if (alive) setOrder(o); })
      .catch(e => console.error('Error loading order:', e))
      .finally(() => { if (alive) setLoading(false); });
    const unsubscribe = orderService.subscribeToOrder(orderId, o => { if (o) setOrder(o); });
    return () => { alive = false; unsubscribe(); };
  }, [orderId]);

  const isCustomer = userData?.role === 'customer';
  const back = isCustomer ? '/orders' : '/jobs';

  if (loading) {
    return (
      <>
        <TopBar title="Order details" back={back} />
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Skeleton className="h-[480px] rounded-2xl" />
          <div className="space-y-5"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-56 rounded-2xl" /></div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <TopBar title="Order details" back={back} />
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">We couldn't find this order.</p>
          <Button onClick={() => navigate(back)} className="mt-5 rounded-xl">Go back</Button>
        </div>
      </>
    );
  }

  const status = statusLabels[order.status];
  const canChat = !!order.riderId && CHAT_STATUSES.includes(order.status);
  const canCancel = isCustomer && ['pending', 'accepted'].includes(order.status);
  const showRate = isCustomer && canRate(order);
  const pickup = toDate(order.pickupDate);
  const pct = order.status === 'cancelled' ? 0 : Math.round((trackIndex(order.status) / (TRACK_STEPS.length - 1)) * 100);

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'Cancel this order?',
      description: `Order #${order.id.slice(-4)} will be cancelled. This can't be undone.`,
      confirmText: 'Cancel order',
      cancelText: 'Keep order',
      destructive: true,
    });
    if (!ok) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.id, order.customerId);
      setOrder(await orderService.getOrder(order.id));
      toast.success('Order cancelled');
    } catch (e) {
      console.error('Failed to cancel order:', e);
      toast.error('Could not cancel the order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <TopBar
        title={`Order #${order.id.slice(-4)}`}
        subtitle={`${SERVICE_EMOJI[order.serviceType]} ${SERVICE_NAMES[order.serviceType]}`}
        back={back}
        actions={
          <span className={cn('hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex', status?.color)}>
            {status?.icon} {status?.label}
          </span>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Stagger className="space-y-5">
          <StaggerItem>
            <Card>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Tracking</h3>
                {order.status !== 'cancelled' && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{pct}%</span>
                )}
              </div>
              <OrderTimeline order={order} />
            </Card>
          </StaggerItem>

          {order.deliveryPhoto && (
            <StaggerItem>
              <Card title="Delivery photo" icon={Camera}>
                <img src={order.deliveryPhoto} alt="Delivery proof" className="max-h-72 w-full rounded-xl border border-border object-cover" />
              </Card>
            </StaggerItem>
          )}
        </Stagger>

        <Stagger className="space-y-5">
          <StaggerItem>
            <Card>
              {isCustomer ? (
                order.riderName ? (
                  <Person label="Your rider" name={order.riderName} phone={order.riderPhone} />
                ) : (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {order.status === 'cancelled' ? 'No rider assigned' : 'Finding a rider near you…'}
                    </p>
                  </div>
                )
              ) : (
                <Person label="Customer" name={order.customerName} phone={order.customerPhone} />
              )}
              {(canChat || canCancel || showRate) && (
                <div className="mt-4 flex gap-2">
                  {canChat && (
                    <Button onClick={() => navigate(`/chat/${order.id}`)} className="h-11 flex-1 rounded-xl">
                      <MessageCircle className="h-4 w-4" /> Chat
                    </Button>
                  )}
                  {showRate && (
                    <Button onClick={() => setRating(order)} variant="outline" className="h-11 flex-1 rounded-xl border-amber-400/60 text-amber-600 hover:bg-amber-400/10 dark:text-amber-300">
                      <Star className="h-4 w-4" /> Rate rider
                    </Button>
                  )}
                  {canCancel && (
                    <Button onClick={handleCancel} disabled={cancelling} variant="outline" className="h-11 flex-1 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10">
                      {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel
                    </Button>
                  )}
                </div>
              )}
              {order.rating && (
                <div className="mt-4 rounded-xl bg-amber-400/10 p-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} className={cn('h-4 w-4', n <= order.rating!.stars ? 'fill-amber-400 text-amber-400' : 'text-border')} />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">{isCustomer ? 'Your review' : 'Customer review'}</span>
                  </div>
                  {order.rating.tags.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{order.rating.tags.join(' · ')}</p>}
                  {order.rating.comment && <p className="mt-1 text-sm text-foreground">“{order.rating.comment}”</p>}
                </div>
              )}
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card title="Pickup" icon={Calendar}>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {pickup?.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' })} · <span className="capitalize">{order.preferredTimeSlot}</span>
                </div>
                <div className="flex items-start gap-2 text-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  {formatAddress(order.customerAddress)}
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {order.declaredItemCount} items declared
                  {order.actualItemCount !== undefined && (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">· {order.actualItemCount} verified ✓</span>
                  )}
                </div>
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Receipt order={order} />
          </StaggerItem>

          {(order.specialInstructions || order.pickupNotes) && (
            <StaggerItem>
              <Card title="Notes" icon={FileText}>
                <div className="space-y-2 text-sm">
                  {order.specialInstructions && (
                    <p className="rounded-xl bg-violet-500/10 p-3 text-foreground"><span className="font-medium">Customer:</span> {order.specialInstructions}</p>
                  )}
                  {order.pickupNotes && (
                    <p className="rounded-xl bg-amber-500/10 p-3 text-foreground"><span className="font-medium">Rider:</span> {order.pickupNotes}</p>
                  )}
                </div>
              </Card>
            </StaggerItem>
          )}
        </Stagger>
      </div>

      <RateRiderModal
        order={rating}
        onOpenChange={o => { if (!o) setRating(null); }}
        onRated={async () => setOrder(await orderService.getOrder(order.id))}
      />
    </>
  );
}
