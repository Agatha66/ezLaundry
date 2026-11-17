import { TopBar } from '@/components/shell/TopBar';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Package,
  Calendar,
  ChevronRight,
  Loader2,
  Hash,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { authService } from '@/services/authService';
import { orderService, statusLabels } from '@/services/orderService';
import type { User as UserType, Order } from '@/types';

export function UserDetail() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userData, allOrders] = await Promise.all([
        authService.getUserData(userId!),
        orderService.getAllOrders()
      ]);

      setUser(userData);

      // Filter orders for this user
      const userOrders = allOrders.filter(o =>
        o.customerId === userId || o.riderId === userId
      );
      setOrders(userOrders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">User not found</p>
          <Button
            onClick={() => navigate('/users')}
            className="mt-4 bg-primary"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalEarnings = orders
    .filter(o => o.riderId === userId && (o.status === 'completed' || o.status === 'delivered'))
    .reduce((sum, o) => sum + o.deliveryFee, 0);

  const serviceNames: Record<string, string> = {
    'wash-fold': 'Wash & Fold',
    'wash-iron': 'Wash & Iron',
    'dry-clean': 'Dry Clean',
  };

  return (
    <div>
      {/* Header */}
      <TopBar back="/users" title={user.displayName || 'User'} subtitle={user.role === 'rider' ? 'Rider details' : 'Customer details'} />

      {/* Content */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* User Profile Card */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 bg-primary">
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {user.displayName || 'Unknown'}
                </h2>
                <div className="space-y-1 mt-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {user.address && (
              <div className="mt-4 pt-4 border-t border-background">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>
                    {user.address.building}, {user.address.street}<br />
                    {user.address.area}, {user.address.city} {user.address.postcode}
                  </span>
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-background">
              <p className="text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 inline mr-2" />
                Joined on {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-semibold text-foreground">{orders.length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{completedOrders.length}</p>
            </div>
            {user.role === 'customer' ? (
              <div className="bg-card rounded-xl p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-semibold text-primary">RM{totalSpent}</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-semibold text-primary">RM{totalEarnings}</p>
              </div>
            )}
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold text-orange-500">
                {orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length}
              </p>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-card rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order History
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-border mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const statusInfo = statusLabels[order.status];

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => navigate(`/order/${order.id}`)}
                      className="p-4 bg-background rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusInfo.color}>
                              <span className="mr-1">{statusInfo.icon}</span>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="font-medium text-foreground">
                            {serviceNames[order.serviceType]}
                          </p>
                          <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Hash className="w-4 h-4" />
                              {order.declaredItemCount} items
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            RM{order.totalAmount}
                          </p>
                          <p className="text-sm text-muted-foreground">{order.weight || order.estimatedWeight} kg</p>
                          <div className="flex items-center gap-1 text-primary text-sm mt-2">
                            <span>View</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
