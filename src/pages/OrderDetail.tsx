import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone,
  FileText,
  Camera,
  User,
  Calendar,
  CreditCard,
  Clock,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { orderService, statusLabels } from '@/services/orderService';
import type { Order } from '@/types';

export function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { userData } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!order || !userData) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.id, order.customerId);
      const updated = await orderService.getOrder(order.id);
      setOrder(updated);
    } catch (e) {
      console.error('Failed to cancel order:', e);
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        const orderData = await orderService.getOrder(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();

    // Subscribe to order updates
    const unsubscribe = orderService.subscribeToOrder(orderId, (updatedOrder) => {
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1188E9]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4A6375]">Order not found</p>
          <Button 
            onClick={() => navigate(userData?.role === 'customer' ? '/orders' : '/jobs')} 
            className="mt-4 bg-[#1188E9]"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusLabels[order.status];
  const serviceNames: Record<string, string> = {
    'wash-fold': 'Wash & Fold',
    'wash-iron': 'Wash & Iron',
    'dry-clean': 'Dry Clean',
  };

  const isCustomer = userData?.role === 'customer';
  const canChat = order.riderId && ['accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering', 'delivered', 'completed'].includes(order.status);
  const canCancel = isCustomer && ['pending', 'accepted'].includes(order.status);

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-[#4A6375]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-[#092635] font-['Poppins']">Order Details</h1>
            </div>
            <Badge className={statusInfo.color}>
              <span className="mr-1">{statusInfo.icon}</span>
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Order ID & Service */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-[#4A6375]">Order ID</p>
                <p className="text-lg font-semibold text-[#092635]">#{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#4A6375]">Service</p>
                <p className="text-lg font-semibold text-[#092635]">{serviceNames[order.serviceType]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#4A6375]">
              <Calendar className="w-4 h-4" />
              <span>Pickup: {new Date(order.pickupDate).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4" />
              <span className="capitalize">{order.preferredTimeSlot}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#092635] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1188E9]" />
              Pricing
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4A6375]">Estimated Price</span>
                <span className="text-[#092635]">RM{order.estimatedPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6375]">Delivery Fee</span>
                <span className="text-[#092635]">RM{order.deliveryFee}</span>
              </div>
              {order.finalPrice && order.finalPrice !== order.estimatedPrice && (
                <div className="flex justify-between">
                  <span className="text-[#4A6375]">Final Price</span>
                  <span className="text-[#092635]">RM{order.finalPrice}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#F5F7F9]">
                <span className="font-semibold text-[#092635]">Total</span>
                <span className="text-lg font-bold text-[#1188E9]">RM{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#092635] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#1188E9]" />
              Items
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4A6375]">Weight</span>
                <span className="text-[#092635]">{order.weight || order.estimatedWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6375]">Items Declared</span>
                <span className="text-[#092635]">{order.declaredItemCount} items</span>
              </div>
              {order.actualItemCount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#4A6375]">Items Verified</span>
                  <span className="text-green-600 font-medium">{order.actualItemCount} items ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Rider Info (for customer) or Customer Info (for rider) */}
          {isCustomer && order.riderName ? (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#092635] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#1188E9]" />
                Rider Information
              </h3>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 bg-[#1188E9]">
                  <AvatarFallback className="bg-[#1188E9] text-white">
                    {order.riderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#092635]">{order.riderName}</p>
                  {order.riderPhone && (
                    <p className="text-sm text-[#4A6375] flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {order.riderPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : !isCustomer && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#092635] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#1188E9]" />
                Customer Information
              </h3>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 bg-[#1188E9]">
                  <AvatarFallback className="bg-[#1188E9] text-white">
                    {order.customerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#092635]">{order.customerName}</p>
                  <p className="text-sm text-[#4A6375] flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {order.customerPhone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pickup Notes */}
          {order.pickupNotes && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#092635] mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1188E9]" />
                Pickup Notes
              </h3>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-[#092635]">{order.pickupNotes}</p>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#092635] mb-3">Special Instructions</h3>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-[#092635]">{order.specialInstructions}</p>
              </div>
            </div>
          )}

          {/* Delivery Photo */}
          {order.deliveryPhoto && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#092635] mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#1188E9]" />
                Delivery Photo
              </h3>
              <div className="rounded-xl overflow-hidden border border-[#D8E5EF]">
                <img
                  src={order.deliveryPhoto}
                  alt="Delivery proof"
                  className="w-full h-auto max-h-64 object-cover"
                />
              </div>
              <p className="text-xs text-[#4A6375] mt-2">
                Photo taken by rider at delivery
              </p>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#092635] mb-4">Status History</h3>
            <div className="space-y-4">
              {order.statusHistory.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    index === order.statusHistory.length - 1 
                      ? 'bg-[#1188E9]' 
                      : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-[#092635] font-medium">
                      {statusLabels[item.status].label}
                    </p>
                    <p className="text-xs text-[#4A6375]">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    {item.note && (
                      <p className="text-xs text-[#4A6375] mt-1">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#092635] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1188E9]" />
              Delivery Address
            </h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#1188E9] flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-[#092635] font-medium">{order.customerAddress.building}</p>
                <p className="text-[#4A6375]">{order.customerAddress.street}</p>
                {order.customerAddress.unit && (
                  <p className="text-[#4A6375]">{order.customerAddress.unit}</p>
                )}
                <p className="text-[#4A6375]">
                  {order.customerAddress.area}, {order.customerAddress.city}
                </p>
                <p className="text-[#4A6375]">{order.customerAddress.postcode}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {canChat && (
              <Button
                onClick={() => navigate(`/chat/${order.id}`)}
                className="flex-1 bg-[#1188E9] hover:bg-[#092635]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            )}
            {canCancel && (
              <Button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
