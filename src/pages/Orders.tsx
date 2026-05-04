import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Clock3,
  ChevronRight,
  MessageCircle,
  Hash,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders } from '@/hooks/useOrders';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { orderService, statusLabels } from '@/services/orderService';
import type { Order } from '@/types';

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
    const statusInfo = statusLabels[order.status];
    const serviceNames: Record<string, string> = {
      'wash-fold': 'Wash & Fold',
      'wash-iron': 'Wash & Iron',
      'dry-clean': 'Dry Clean',
    };
    const canChat = order.riderId && ['accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering', 'delivered', 'completed'].includes(order.status);
    const canCancel = ['pending', 'accepted'].includes(order.status);

    const handleCancel = async () => {
      if (!window.confirm('Are you sure you want to cancel this order?')) return;
      setCancelling(true);
      try {
        await orderService.cancelOrder(order.id, order.customerId);
        alert('Order cancelled successfully');
      } catch (e) {
        alert('Failed to cancel order');
      } finally {
        setCancelling(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-5 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#092635]">{serviceNames[order.serviceType]}</p>
              <Badge className={statusInfo.color}>
                <span className="mr-1">{statusInfo.icon}</span>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-[#4A6375] mt-1">Order #{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-[#092635]">
              RM{order.totalAmount}
            </p>
            <p className="text-sm text-[#4A6375]">{order.weight || order.estimatedWeight} kg</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[#4A6375]">
            <Clock3 className="w-4 h-4" />
            <span>Pickup: {new Date(order.pickupDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-[#4A6375]">
            <MapPin className="w-4 h-4" />
            <span>{order.customerAddress.building}, {order.customerAddress.area}</span>
          </div>
          <div className="flex items-center gap-2 text-[#4A6375]">
            <Hash className="w-4 h-4" />
            <span>{order.declaredItemCount} items declared</span>
            {order.actualItemCount !== undefined && (
              <span className="text-green-600">({order.actualItemCount} verified)</span>
            )}
          </div>
        </div>

        {/* Rider Info */}
        {order.riderName && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-[#092635]">
              <span className="text-[#4A6375]">Rider:</span> {order.riderName}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#F5F7F9]">
          <Button
            variant="outline"
            className="flex-1 border-[#D8E5EF]"
            onClick={() => navigate(`/order/${order.id}`)}
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          {canChat && (
            <Button
              className="flex-1 bg-[#1188E9] hover:bg-[#092635]"
              onClick={() => navigate(`/chat/${order.id}`)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  function OrdersList({ orders, emptyMessage }: { orders: Order[]; loading: boolean; emptyMessage: string }) {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="w-12 h-12 text-[#D8E5EF] mx-auto mb-4" />
          <p className="text-[#4A6375]">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  };

export function Orders() {
  const { userData } = useAuth();
  const { orders, loading, refresh } = useCustomerOrders(userData?.uid);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOrderCreated = () => {
    refresh();
    setIsCreateDialogOpen(false);
  };

  // Filter orders
  const activeOrders = orders.filter(o => 
    !['completed', 'delivered', 'cancelled'].includes(o.status)
  );
  const completedOrders = orders.filter(o => 
    ['completed', 'delivered'].includes(o.status)
  );
  const cancelledOrders = orders.filter(o => 
    o.status === 'cancelled'
  );

  

  return (
    <div className="min-h-screen bg-[#F5F7F9] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-[#092635] font-['Poppins']">My Orders</h1>
            <Button
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#1188E9] hover:bg-[#092635]"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </header>

      {/* Orders Tabs */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <OrdersList 
              orders={activeOrders}
              loading={loading}
              emptyMessage="No active orders. Create a new order to get started!"
            />
          </TabsContent>

          <TabsContent value="completed">
            <OrdersList 
              orders={completedOrders}
              loading={loading}
              emptyMessage="No completed orders yet."
            />
          </TabsContent>

          <TabsContent value="cancelled">
            <OrdersList 
              orders={cancelledOrders}
              loading={loading}
              emptyMessage="No cancelled orders."
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Order Dialog */}
      <CreateOrderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}
