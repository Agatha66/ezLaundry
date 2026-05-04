import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users, 
  Bike, 
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Trash2,
  AlertTriangle,
  X,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import type { User as UserType } from '@/types';

export function AdminUsers() {
  const navigate = useNavigate();
  const { userData: currentAdmin } = useAuth();
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [riders, setRiders] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await authService.getAllUsers();
      setCustomers(allUsers.filter(u => u.role === 'customer'));
      setRiders(allUsers.filter(u => u.role === 'rider'));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      await authService.deleteUser(userToDelete.uid);
      
      // Update local state
      if (userToDelete.role === 'customer') {
        setCustomers(prev => prev.filter(u => u.uid !== userToDelete.uid));
      } else {
        setRiders(prev => prev.filter(u => u.uid !== userToDelete.uid));
      }
      
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filterUsers = (users: UserType[]) => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.displayName?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    );
  };

  const filteredCustomers = filterUsers(customers);
  const filteredRiders = filterUsers(riders);

  const UserCard = ({ user }: { user: UserType }) => {
    const isCurrentUser = user.uid === currentAdmin?.uid;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(`/user/${user.uid}`)}
        className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 bg-[#1188E9]">
            <AvatarFallback className="bg-[#1188E9] text-white">
              {user.displayName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-[#092635]">{user.displayName || 'Unknown'}</p>
                <div className="space-y-1 mt-1">
                  <p className="text-sm text-[#4A6375] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  {user.phone && (
                    <p className="text-sm text-[#4A6375] flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </p>
                  )}
                  {user.address && (
                    <p className="text-sm text-[#4A6375] flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{user.address.area}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isCurrentUser && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserToDelete(user);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <ChevronRight className="w-5 h-5 text-[#4A6375]" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </Badge>
              {isCurrentUser && (
                <Badge className="bg-[#1188E9] text-white text-xs">
                  You
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-[#092635] font-['Poppins']">Users</h1>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4A6375]" />
              <span className="text-sm text-[#4A6375]">{customers.length + riders.length} total</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A6375]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-12 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Customers ({filteredCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="riders" className="flex items-center gap-2">
              <Bike className="w-4 h-4" />
              Riders ({filteredRiders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1188E9]" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <User className="w-12 h-12 text-[#D8E5EF] mx-auto mb-4" />
                <p className="text-[#4A6375]">
                  {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <UserCard key={customer.uid} user={customer} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="riders">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1188E9]" />
              </div>
            ) : filteredRiders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Bike className="w-12 h-12 text-[#D8E5EF] mx-auto mb-4" />
                <p className="text-[#4A6375]">
                  {searchQuery ? 'No riders found matching your search' : 'No riders yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRiders.map((rider) => (
                  <UserCard key={rider.uid} user={rider} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !deleting && setUserToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <button
                  onClick={() => !deleting && setUserToDelete(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={deleting}
                >
                  <X className="w-5 h-5 text-[#4A6375]" />
                </button>
              </div>

              <h3 className="text-xl font-semibold text-[#092635] mb-2">
                Delete User?
              </h3>
              <p className="text-[#4A6375] mb-6">
                Are you sure you want to delete <span className="font-medium text-[#092635]">{userToDelete.displayName || userToDelete.email}</span>? 
                This action cannot be undone and all their data will be permanently removed.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setUserToDelete(null)}
                  disabled={deleting}
                  className="flex-1 h-12 rounded-xl border-[#D8E5EF]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
