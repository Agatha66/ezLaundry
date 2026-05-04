import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Bike,
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
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1188E9]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4A6375]">User not found</p>
          <Button 
            onClick={() => navigate('/users')} 
            className="mt-4 bg-[#1188E9]"
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
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/users')}
                className="text-[#4A6375]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-[#092635] font-['Poppins']">
                {user.role === 'rider' ? 'Rider Details' : 'Customer Details'}
              </h1>
            </div>
            <Badge className={user.role === 'rider' ? 'bg-[#1A7A7E]' : 'bg-[#1188E9]'}>
              {user.role === 'rider' ? (
                <><Bike className="w-3 h-3 mr-1" /> Rider</>
              ) : (
                <><User className="w-3 h-3 mr-1" /> Customer</>
              )}
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
          {/* User Profile Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 bg-[#1188E9]">
                <AvatarFallback className="bg-[#1188E9] text-white text-2xl">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#092635]">
                  {user.displayName || 'Unknown'}
                </h2>
                <div className="space-y-1 mt-2">
                  <p className="text-sm text-[#4A6375] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-sm text-[#4A6375] flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {user.address && (
              <div className="mt-4 pt-4 border-t border-[#F5F7F9]">
                <p className="text-sm text-[#4A6375] flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>
                    {user.address.building}, {user.address.street}<br />
                    {user.address.area}, {user.address.city} {user.address.postcode}
                  </span>
                </p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-[#F5F7F9]">
              <p className="text-sm text-[#4A6375]">
                <Calendar className="w-4 h-4 inline mr-2" />
                Joined on {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-[#4A6375]">Total Orders</p>
              <p className="text-2xl font-semibold text-[#092635]">{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-[#4A6375]">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{completedOrders.length}</p>
            </div>
            {user.role === 'customer' ? (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-[#4A6375]">Total Spent</p>
                <p className="text-2xl font-semibold text-[#1188E9]">RM{totalSpent}</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-[#4A6375]">Total Earnings</p>
                <p className="text-2xl font-semibold text-[#1188E9]">RM{totalEarnings}</p>
              </div>
            )}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-[#4A6375]">Active</p>
              <p className="text-2xl font-semibold text-orange-500">
                {orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length}
              </p>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#092635] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#1188E9]" />
              Order History
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-[#D8E5EF] mx-auto mb-4" />
                <p className="text-[#4A6375]">No orders yet</p>
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
                      className="p-4 bg-[#F5F7F9] rounded-xl cursor-pointer hover:bg-[#E6F4FF] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusInfo.color}>
                              <span className="mr-1">{statusInfo.icon}</span>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="font-medium text-[#092635]">
                            {serviceNames[order.serviceType]}
                          </p>
                          <p className="text-sm text-[#4A6375]">Order #{order.id}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[#4A6375]">
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
                          <p className="font-semibold text-[#092635]">
                            RM{order.totalAmount}
                          </p>
                          <p className="text-sm text-[#4A6375]">{order.weight || order.estimatedWeight} kg</p>
                          <div className="flex items-center gap-1 text-[#1188E9] text-sm mt-2">
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
      </main>
    </div>
  );
}
