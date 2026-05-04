import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';
import type { Order } from '@/types';

interface ReportStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalRiders: number;
  completedOrders: number;
  pendingOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

export function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allOrders, allUsers] = await Promise.all([
        orderService.getAllOrders(),
        authService.getAllUsers()
      ]);

      setOrders(allOrders);

      const customers = allUsers.filter(u => u.role === 'customer');
      const riders = allUsers.filter(u => u.role === 'rider');

      const completedOrders = allOrders.filter(o => o.status === 'completed');
      const pendingOrders = allOrders.filter(o => o.status === 'pending');
      const cancelledOrders = allOrders.filter(o => o.status === 'cancelled');
      const activeOrders = allOrders.filter(o => 
        !['completed', 'cancelled', 'delivered'].includes(o.status)
      );

      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const averageOrderValue = completedOrders.length > 0 
        ? totalRevenue / completedOrders.length 
        : 0;

      setStats({
        totalOrders: allOrders.length,
        totalRevenue,
        totalCustomers: customers.length,
        totalRiders: riders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        activeOrders: activeOrders.length,
        cancelledOrders: cancelledOrders.length,
        averageOrderValue
      });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
  }) => (
    <Card className="border-none shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#4A6375]">{title}</p>
            <p className="text-2xl font-semibold text-[#092635] mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OrderStatusCard = ({ 
    title, 
    count, 
    total, 
    color 
  }: { 
    title: string; 
    count: number; 
    total: number; 
    color: string;
  }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#4A6375]">{title}</span>
          <span className="text-sm font-medium text-[#092635]">{count}</span>
        </div>
        <div className="w-full h-2 bg-[#F5F7F9] rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-[#4A6375] mt-1">{percentage}% of total orders</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1188E9]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-[#092635] font-['Poppins']">Reports</h1>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4A6375]" />
              <span className="text-sm text-[#4A6375]">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Revenue"
                value={`RM${stats.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                color="bg-green-500"
              />
              <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={Package}
                color="bg-[#1188E9]"
              />
              <StatCard
                title="Customers"
                value={stats.totalCustomers}
                icon={Users}
                color="bg-purple-500"
              />
              <StatCard
                title="Riders"
                value={stats.totalRiders}
                icon={TrendingUp}
                color="bg-[#1A7A7E]"
              />
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#092635] mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#1188E9]" />
                Order Status Breakdown
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <OrderStatusCard
                  title="Completed"
                  count={stats.completedOrders}
                  total={stats.totalOrders}
                  color="bg-green-500"
                />
                <OrderStatusCard
                  title="Active"
                  count={stats.activeOrders}
                  total={stats.totalOrders}
                  color="bg-[#1188E9]"
                />
                <OrderStatusCard
                  title="Pending"
                  count={stats.pendingOrders}
                  total={stats.totalOrders}
                  color="bg-yellow-500"
                />
                <OrderStatusCard
                  title="Cancelled"
                  count={stats.cancelledOrders}
                  total={stats.totalOrders}
                  color="bg-red-500"
                />
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#092635] mb-4">Average Order Value</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#E6F4FF] rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-[#1188E9]" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#092635]">
                      RM{stats.averageOrderValue.toFixed(2)}
                    </p>
                    <p className="text-sm text-[#4A6375]">Per completed order</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#092635] mb-4">Completion Rate</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#092635]">
                      {stats.totalOrders > 0 
                        ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
                        : 0}%
                    </p>
                    <p className="text-sm text-[#4A6375]">Orders completed successfully</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#092635] mb-4">Recent Orders</h3>
              {orders.length === 0 ? (
                <p className="text-[#4A6375] text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-[#F5F7F9] rounded-lg">
                      <div>
                        <p className="font-medium text-[#092635]">Order #{order.id.slice(-4)}</p>
                        <p className="text-sm text-[#4A6375]">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#092635]">RM{order.totalAmount}</p>
                        <p className="text-xs text-[#4A6375] capitalize">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
