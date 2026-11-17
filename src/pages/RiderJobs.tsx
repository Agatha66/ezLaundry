import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { TopBar } from '@/components/shell/TopBar';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { ListSkeleton } from '@/components/Skeletons';
import { CountUp } from '@/components/motion';
import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Loader2,
  Camera,
  FileText,
  Hash,
  ArrowRight,
  X,
  MessageCircle,
  ImageIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRiderOrders, usePendingOrders } from '@/hooks/useOrders';
import { orderService, statusLabels, statusFlow } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';

export function RiderJobs() {
  const { userData } = useAuth();
  const { activeOrders, completedOrders, loading: loadingMine, refresh: refreshRiderOrders } = useRiderOrders(userData?.uid);
  const { orders: pendingOrders, loading: loadingPending, refresh: refreshPendingOrders } = usePendingOrders();
  const [tab, setTab] = useState<'available' | 'active' | 'completed'>('available');
  const [payingOrder, setPayingOrder] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null);
  // Feedback goes to toasts
  const setError = (m: string | null) => { if (m) toast.error(m); };
  const setSuccess = (m: string | null) => { if (m) toast.success(m); };

  const handleMarkPaid = async (order: Order) => {
    if (!userData) return;
    setPayingOrder(order.id);
    try {
      await orderService.markPaymentReceived(order.id, userData.uid);
      await refreshRiderOrders();
      toast.success(`Payment of RM${order.totalAmount} recorded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not record payment');
    } finally {
      setPayingOrder(null);
    }
  };

  // Pickup form state
  const [actualItemCount, setActualItemCount] = useState<number>(0);
  const [pickupNotes, setPickupNotes] = useState('');

  // Delivery photo state
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleAcceptOrder = async (order: Order) => {
    if (!userData) {
      setError('Please log in to accept orders');
      return;
    }

    setAcceptingOrder(order.id);
    setError(null);

    try {
      await orderService.acceptOrder(
        order.id,
        userData.uid,
        userData.displayName || 'Rider',
        userData.phone || ''
      );

      setSuccess(`Order ${order.id} accepted successfully!`);
      await refreshPendingOrders();
      await refreshRiderOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to accept order:', err);
      setError(err.message || 'Failed to accept order. Please try again.');
    } finally {
      setAcceptingOrder(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!userData) return;

    setUpdatingStatus(true);
    setError(null);

    try {
      await orderService.updateStatus(orderId, newStatus, userData.uid);
      await refreshRiderOrders();

      if (selectedOrder?.id === orderId) {
        const updated = await orderService.getOrder(orderId);
        setSelectedOrder(updated);
      }

      setSuccess(`Status updated to ${statusLabels[newStatus].label}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePickupSubmit = async () => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    setError(null);

    try {
      await orderService.recordPickup(
        selectedOrder.id,
        userData!.uid,
        actualItemCount,
        pickupNotes
      );

      await refreshRiderOrders();
      const updated = await orderService.getOrder(selectedOrder.id);
      setSelectedOrder(updated);

      setIsPickupDialogOpen(false);
      setActualItemCount(0);
      setPickupNotes('');
      setSuccess('Pickup recorded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to record pickup:', err);
      setError(err.message || 'Failed to record pickup');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeliverySubmit = async () => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    setError(null);

    try {
      await orderService.recordDelivery(
        selectedOrder.id,
        userData!.uid,
        deliveryPhoto || undefined
      );

      await refreshRiderOrders();
      const updated = await orderService.getOrder(selectedOrder.id);
      setSelectedOrder(updated);

      setIsDeliveryDialogOpen(false);
      setDeliveryPhoto(null);
      setSuccess('Delivery recorded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to record delivery:', err);
      setError(err.message || 'Failed to record delivery');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Compress image to fit Firestore's 1MB per-field limit
  // Base64 has ~33% overhead, so we target 0.7MB to stay safely under 1MB
  const MAX_IMAGE_SIZE_MB = 0.7;
  const compressImage = (dataUrl: string, maxSizeMB: number = MAX_IMAGE_SIZE_MB): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        let { width, height } = img;
        // Start with a max dimension cap for very large images
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Binary search for the best quality that fits under the limit
        let low = 0.05;
        let high = 0.92;
        let bestResult = canvas.toDataURL('image/jpeg', 0.05);

        while (high - low > 0.02) {
          const mid = (low + high) / 2;
          const result = canvas.toDataURL('image/jpeg', mid);
          const sizeMB = result.length / 1024 / 1024;

          if (sizeMB <= maxSizeMB) {
            bestResult = result;
            low = mid;
          } else {
            high = mid;
          }
        }

        // If still too large at best quality, shrink dimensions
        let resultSizeMB = bestResult.length / 1024 / 1024;
        if (resultSizeMB > maxSizeMB) {
          let scale = 0.85;
          while (resultSizeMB > maxSizeMB && (width * scale > 200 || height * scale > 200)) {
            canvas.width = Math.floor(width * scale);
            canvas.height = Math.floor(height * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            bestResult = canvas.toDataURL('image/jpeg', 0.7);
            resultSizeMB = bestResult.length / 1024 / 1024;
            scale *= 0.85;
          }
        }

        console.log(`[Image] Compressed to ${(bestResult.length / 1024 / 1024).toFixed(2)}MB (${canvas.width}x${canvas.height})`);
        resolve(bestResult);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (browser allows up to 50MB before read fails)
    if (file.size > 50 * 1024 * 1024) {
      setError('Image too large. Maximum 50MB.');
      return;
    }

    setCompressing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const originalDataUrl = reader.result as string;
        const originalSizeMB = originalDataUrl.length / 1024 / 1024;
        console.log(`[Image] Original: ${originalSizeMB.toFixed(1)}MB`);

        // Always compress to ensure we stay under Firestore 1MB limit
        const compressed = await compressImage(originalDataUrl, MAX_IMAGE_SIZE_MB);
        const compressedSizeMB = compressed.length / 1024 / 1024;
        console.log(`[Image] Final: ${compressedSizeMB.toFixed(2)}MB`);
        setDeliveryPhoto(compressed);
      } catch (err) {
        console.error('Failed to process image:', err);
        setError('Failed to process image. Please try a smaller image.');
      } finally {
        setCompressing(false);
      }
    };
    reader.onerror = () => {
      setCompressing(false);
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const openPickupDialog = (order: Order) => {
    setSelectedOrder(order);
    setActualItemCount(order.declaredItemCount || 0);
    setPickupNotes('');
    setIsPickupDialogOpen(true);
  };

  const openDeliveryDialog = (order: Order) => {
    setSelectedOrder(order);
    setDeliveryPhoto(null);
    setIsDeliveryDialogOpen(true);
  };

  const todayEarnings = completedOrders
    .filter(o => new Date(o.completedAt || o.updatedAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + (Number(o.deliveryFee) || 0), 0);
  const loading = tab === 'available' ? loadingPending : loadingMine;

  return (
    <>
      <TopBar title="Jobs" subtitle="Pickups, washes and deliveries" />

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Available', value: pendingOrders.length, tint: 'text-amber-500' },
          { label: 'In progress', value: activeOrders.length, tint: 'text-primary' },
          { label: 'Earned today', value: todayEarnings, prefix: 'RM', tint: 'text-emerald-500' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
            <CountUp value={s.value} prefix={s.prefix} className={`block font-poppins text-xl font-semibold sm:text-2xl ${s.tint}`} />
            <p className="text-[11px] text-muted-foreground sm:text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        className="mb-5"
        items={[
          { value: 'available', label: 'Available', count: pendingOrders.length },
          { value: 'active', label: 'My jobs', count: activeOrders.length },
          { value: 'completed', label: 'Done', count: completedOrders.length },
        ]}
      />

      {loading ? (
        <ListSkeleton rows={3} />
      ) : (
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            {tab === 'available' && (
              <AvailableOrdersList orders={pendingOrders} onAccept={handleAcceptOrder} acceptingOrder={acceptingOrder} />
            )}
            {tab === 'active' && (
              <MyJobsList
                orders={activeOrders}
                onUpdateStatus={handleUpdateStatus}
                onViewDetail={openOrderDetail}
                onPickup={openPickupDialog}
                onDeliver={openDeliveryDialog}
                onMarkPaid={handleMarkPaid}
                payingOrder={payingOrder}
                updatingStatus={updatingStatus}
              />
            )}
            {tab === 'completed' && <CompletedOrdersList orders={completedOrders} />}
          </motion.div>
      )}

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        isOpen={isOrderDetailOpen}
        onClose={() => {
          setIsOrderDetailOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        updatingStatus={updatingStatus}
      />

      {/* Pickup Dialog */}
      <PickupDialog
        order={selectedOrder}
        isOpen={isPickupDialogOpen}
        onClose={() => setIsPickupDialogOpen(false)}
        actualItemCount={actualItemCount}
        setActualItemCount={setActualItemCount}
        pickupNotes={pickupNotes}
        setPickupNotes={setPickupNotes}
        onSubmit={handlePickupSubmit}
        updatingStatus={updatingStatus}
      />

      {/* Delivery Dialog */}
      <DeliveryDialog
        order={selectedOrder}
        isOpen={isDeliveryDialogOpen}
        onClose={() => setIsDeliveryDialogOpen(false)}
        deliveryPhoto={deliveryPhoto}
        onFileChange={handleFileChange}
        onSubmit={handleDeliverySubmit}
        updatingStatus={updatingStatus}
        compressing={compressing}
        cameraInputRef={cameraInputRef}
        galleryInputRef={galleryInputRef}
        onClearPhoto={() => setDeliveryPhoto(null)}
      />
    </>
  );
}

// Available Orders List
function AvailableOrdersList({
  orders,
  onAccept,
  acceptingOrder
}: {
  orders: Order[];
  onAccept: (order: Order) => void;
  acceptingOrder: string | null;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-muted-foreground">No available orders right now</p>
        <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <AnimatePresence initial={false}>
      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700">
                  ⏳ Looking for Rider
                </Badge>
              </div>
              <p className="font-semibold text-foreground mt-2">
                {order.customerAddress.building}, {order.customerAddress.area}
              </p>
              <p className="text-sm text-muted-foreground">{order.customerAddress.street}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(order.pickupDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {order.estimatedWeight} kg
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  {order.declaredItemCount} items
                </span>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-lg font-semibold text-primary">
                RM{order.deliveryFee}
              </p>
              <p className="text-xs text-muted-foreground">Delivery fee</p>
              <Button
                size="sm"
                onClick={() => onAccept(order)}
                disabled={acceptingOrder === order.id}
                className="mt-3 bg-primary hover:bg-navy"
              >
                {acceptingOrder === order.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
      </AnimatePresence>
    </div>
  );
}

// My Jobs List
function MyJobsList({
  orders,
  onUpdateStatus,
  onViewDetail,
  onPickup,
  onDeliver,
  onMarkPaid,
  payingOrder,
  updatingStatus
}: {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onViewDetail: (order: Order) => void;
  onPickup: (order: Order) => void;
  onDeliver: (order: Order) => void;
  onMarkPaid: (order: Order) => void;
  payingOrder: string | null;
  updatingStatus: boolean;
}) {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <Package className="w-12 h-12 text-border mx-auto mb-4" />
        <p className="text-muted-foreground">No active jobs</p>
        <p className="text-sm text-muted-foreground mt-1">Accept an order from the Available tab</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <AnimatePresence initial={false}>
      {orders.map((order) => {
        const statusInfo = statusLabels[order.status];
        const nextStatuses = statusFlow[order.status] || [];
        const nextStatus = nextStatuses[0];
        const canChat = order.riderId && ['accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering', 'delivered', 'completed'].includes(order.status);

        const getActionButton = () => {
          if (!nextStatus) return null;

          if (nextStatus === 'picked-up') {
            return (
              <Button
                size="sm"
                onClick={() => onPickup(order)}
                disabled={updatingStatus}
                className="bg-primary hover:bg-navy"
              >
                <Hash className="w-4 h-4 mr-1" />
                Record Pickup
              </Button>
            );
          }

          if (nextStatus === 'delivered') {
            return (
              <Button
                size="sm"
                onClick={() => onDeliver(order)}
                disabled={updatingStatus}
                className="bg-green-600 hover:bg-green-700"
              >
                <Camera className="w-4 h-4 mr-1" />
                Record Delivery
              </Button>
            );
          }

          const actionLabels: Record<string, string> = {
            'picking-up': 'Start Pickup',
            'to-laundry': 'Going to Laundry',
            'at-laundry': 'Arrived at Laundry',
            'washing': 'Start Washing',
            'washed': 'Washing Done',
            'delivering': 'Start Delivery',
            'completed': 'Complete Order',
          };

          return (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              disabled={updatingStatus}
              className="bg-primary hover:bg-navy"
            >
              {updatingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-1" />
                  {actionLabels[nextStatus] || 'Update'}
                </>
              )}
            </Button>
          );
        };

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={statusInfo.color}>
                    <span className="mr-1">{statusInfo.icon}</span>
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="font-semibold text-foreground mt-2">
                  {order.customerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.customerAddress.building}, {order.customerAddress.street}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {order.customerPhone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {order.declaredItemCount} items
                    {order.actualItemCount !== undefined && (
                      <span className="text-green-600 ml-1">
                        (✓ {order.actualItemCount} verified)
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-lg font-semibold text-primary">
                  RM{order.deliveryFee}
                </p>
                <p className="text-xs text-muted-foreground">#{order.id.slice(-4)}</p>
              </div>
            </div>

            {/* Payment */}
            {['delivering', 'delivered'].includes(order.status) && (
              order.paymentStatus === 'paid' ? (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Paid · {order.paymentMethod === 'ewallet' ? 'e-Wallet' : 'Cash'}
                </p>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkPaid(order)}
                  disabled={payingOrder === order.id}
                  className="mt-3 w-full rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                >
                  {payingOrder === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                  Collect RM{order.totalAmount} · {order.paymentMethod === 'ewallet' ? 'e-Wallet' : 'Cash'}
                </Button>
              )
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetail(order)}
                className="flex-1 border-border"
              >
                Details
              </Button>
              {canChat && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/chat/${order.id}`)}
                  className="flex-1 border-border text-primary"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Button>
              )}
              <div className="flex-1">
                {getActionButton()}
              </div>
            </div>
          </motion.div>
        );
      })}
      </AnimatePresence>
    </div>
  );
}

// Completed Orders List
function CompletedOrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <CheckCircle2 className="w-12 h-12 text-border mx-auto mb-4" />
        <p className="text-muted-foreground">No completed orders yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <AnimatePresence initial={false}>
      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customerAddress.area} • {order.weight || order.estimatedWeight}kg
                </p>
                {order.actualItemCount && (
                  <p className="text-xs text-green-600">
                    ✓ {order.actualItemCount} items delivered
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">RM{order.deliveryFee}</p>
              <p className="text-xs text-muted-foreground">
                {order.completedAt && new Date(order.completedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
      </AnimatePresence>
    </div>
  );
}

// Order Detail Dialog
function OrderDetailDialog({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  updatingStatus,
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  updatingStatus: boolean;
}) {
  if (!order) return null;

  const statusInfo = statusLabels[order.status];
  const nextStatuses = statusFlow[order.status] || [];

  const serviceNames: Record<string, string> = {
    'wash-fold': 'Wash & Fold',
    'wash-iron': 'Wash & Iron',
    'dry-clean': 'Dry Clean',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-background rounded-xl">
            <span className="text-muted-foreground">Current Status</span>
            <Badge className={statusInfo.color}>
              <span className="mr-1">{statusInfo.icon}</span>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <p className="text-foreground font-medium">{order.customerName}</p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {order.customerPhone}
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {order.customerAddress.building}, {order.customerAddress.street}
              </p>
            </div>
          </div>

          {/* Order Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Order Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="text-foreground">{serviceNames[order.serviceType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span className="text-foreground">{order.weight || order.estimatedWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items Declared</span>
                <span className="text-foreground">{order.declaredItemCount} items</span>
              </div>
              {order.actualItemCount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items Verified</span>
                  <span className="text-green-600 font-medium">{order.actualItemCount} items ✓</span>
                </div>
              )}
              {order.specialInstructions && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium">Special Instructions:</p>
                  <p className="text-sm text-yellow-700 mt-1">{order.specialInstructions}</p>
                </div>
              )}
              {order.pickupNotes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">Pickup Notes:</p>
                  <p className="text-sm text-blue-700 mt-1">{order.pickupNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Status History</h3>
            <div className="space-y-3">
              {order.statusHistory.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-foreground">{statusLabels[item.status].label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {nextStatuses.length > 0 && (
            <div className="pt-4 border-t border-background">
              <p className="text-sm text-muted-foreground mb-3">Update Status:</p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    onClick={() => {
                      onUpdateStatus(order.id, status);
                      onClose();
                    }}
                    disabled={updatingStatus}
                    className="bg-primary hover:bg-navy"
                  >
                    {statusLabels[status].icon} {statusLabels[status].label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Pickup Dialog
function PickupDialog({
  order,
  isOpen,
  onClose,
  actualItemCount,
  setActualItemCount,
  pickupNotes,
  setPickupNotes,
  onSubmit,
  updatingStatus,
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  actualItemCount: number;
  setActualItemCount: (count: number) => void;
  pickupNotes: string;
  setPickupNotes: (notes: string) => void;
  onSubmit: () => void;
  updatingStatus: boolean;
}) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Record Pickup
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Verify the actual item count and add any pickup notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-background rounded-xl">
            <p className="text-sm text-muted-foreground">Order #{order.id.slice(-4)}</p>
            <p className="font-medium text-foreground">{order.customerName}</p>
          </div>

          <div>
            <Label className="text-foreground font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Actual Item Count
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Customer declared: <span className="font-medium text-foreground">{order.declaredItemCount} items</span>
            </p>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setActualItemCount(Math.max(0, actualItemCount - 1))}
                className="h-10 w-10"
              >
                -
              </Button>
              <Input
                type="number"
                value={actualItemCount}
                onChange={(e) => setActualItemCount(parseInt(e.target.value) || 0)}
                className="text-center text-lg font-semibold w-24"
                min={0}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setActualItemCount(actualItemCount + 1)}
                className="h-10 w-10"
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="pickupNotes" className="text-foreground font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pickup Notes (Optional)
            </Label>
            <Textarea
              id="pickupNotes"
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="Any notes about the pickup..."
              className="mt-2 min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={updatingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1 bg-primary hover:bg-navy"
              disabled={updatingStatus || actualItemCount <= 0}
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Pickup
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Delivery Dialog
function DeliveryDialog({
  order,
  isOpen,
  onClose,
  deliveryPhoto,
  onFileChange,
  onSubmit,
  updatingStatus,
  compressing,
  cameraInputRef,
  galleryInputRef,
  onClearPhoto,
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  deliveryPhoto: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  updatingStatus: boolean;
  compressing: boolean;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  galleryInputRef: React.RefObject<HTMLInputElement | null>;
  onClearPhoto: () => void;
}) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Record Delivery
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Take a delivery photo as proof and confirm delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-background rounded-xl">
            <p className="text-sm text-muted-foreground">Order #{order.id.slice(-4)}</p>
            <p className="font-medium text-foreground">{order.customerName}</p>
            {order.actualItemCount && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {order.actualItemCount} items to deliver
              </p>
            )}
          </div>

          <div>
            <Label className="text-foreground font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Delivery Photo (Optional)
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Take a photo or choose from gallery for proof
            </p>

            {/* Camera input - opens camera on mobile */}
            <input
              type="file"
              ref={cameraInputRef}
              onChange={onFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
            {/* Gallery input - opens file picker without capture */}
            <input
              type="file"
              ref={galleryInputRef}
              onChange={onFileChange}
              accept="image/*"
              className="hidden"
            />

            {compressing ? (
              <div className="w-full h-48 border-2 border-dashed border-primary rounded-xl flex flex-col items-center justify-center gap-3 bg-primary/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="text-center">
                  <p className="text-foreground font-medium">Compressing image...</p>
                  <p className="text-sm text-muted-foreground">Large images are auto-compressed</p>
                </div>
              </div>
            ) : deliveryPhoto ? (
              <div className="relative">
                <img
                  src={deliveryPhoto}
                  alt="Delivery proof"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={onClearPhoto}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium text-sm">Camera</p>
                    <p className="text-xs text-muted-foreground">Take photo</p>
                  </div>
                </button>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex-1 h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium text-sm">Gallery</p>
                    <p className="text-xs text-muted-foreground">Choose photo</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={updatingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Delivery
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
