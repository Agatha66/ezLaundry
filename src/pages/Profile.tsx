import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shirt, 
  LogOut, 
  User, 
  Phone, 
  MapPin, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import type { Address } from '@/types';

export function Profile() {
  const navigate = useNavigate();
  const { userData, logout, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [address, setAddress] = useState<Address>(userData?.address || {
    street: '',
    unit: '',
    building: '',
    area: 'Damansara Perdana',
    city: 'Petaling Jaya',
    postcode: '',
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!currentUser) {
        setError('You must be logged in');
        return;
      }

      // Update user data in Firestore
      const updates: any = {
        displayName,
        phone,
      };

      // Only update address for customers
      if (userData?.role === 'customer') {
        updates.address = address;
      }

      await authService.updateUserData(currentUser.uid, updates);
      
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const getRoleColor = () => {
    switch (userData?.role) {
      case 'admin':
        return 'bg-[#092635]';
      case 'rider':
        return 'bg-[#1A7A7E]';
      default:
        return 'bg-[#1188E9]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1188E9] rounded-full flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#092635] font-['Poppins']">ezLaundry</span>
            </Link>

            <div className="flex items-center gap-4">
              {/* <Link to={getDashboardLink()}>
                <Button variant="ghost" className="text-[#4A6375]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link> */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-[#4A6375] hover:text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header */}
          <div className="text-center mb-8">
            <Avatar className={`w-24 h-24 ${getRoleColor()} mx-auto mb-4`}>
              <AvatarFallback className={`${getRoleColor()} text-white text-2xl font-semibold`}>
                {userData?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-semibold text-[#092635] font-['Poppins']">
              {userData?.displayName}
            </h1>
            <p className="text-[#4A6375] capitalize">{userData?.role}</p>
            <p className="text-sm text-[#4A6375]">{userData?.email}</p>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">{success}</p>
            </motion.div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile}>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className={`grid w-full mb-6 ${userData?.role === 'customer' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <TabsTrigger value="personal">
                  <User className="w-4 h-4 mr-2" />
                  Personal Info
                </TabsTrigger>
                {userData?.role === 'customer' && (
                  <TabsTrigger value="address">
                    <MapPin className="w-4 h-4 mr-2" />
                    Address
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="personal">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-[#092635]">
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="displayName" className="text-[#092635] font-medium">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-[#092635] font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData?.email}
                        disabled
                        className="mt-2 h-12 rounded-xl border-[#D8E5EF] bg-[#F5F7F9] text-[#4A6375]"
                      />
                      <p className="text-xs text-[#4A6375] mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-[#092635] font-medium">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#1188E9] hover:bg-[#092635] text-white rounded-full font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {userData?.role === 'customer' && (
                <TabsContent value="address">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-[#092635]">
                        <MapPin className="w-5 h-5 inline mr-2" />
                        Default Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="street" className="text-[#092635] font-medium">
                          Street Address *
                        </Label>
                        <Input
                          id="street"
                          name="street"
                          type="text"
                          placeholder="e.g., Jalan PJU 8/1"
                          value={address.street}
                          onChange={handleAddressChange}
                          required
                          className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unit" className="text-[#092635] font-medium">
                            Unit/Floor
                          </Label>
                          <Input
                            id="unit"
                            name="unit"
                            type="text"
                            placeholder="e.g., Unit 5-2"
                            value={address.unit}
                            onChange={handleAddressChange}
                            className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="building" className="text-[#092635] font-medium">
                            Building/Block *
                          </Label>
                          <Input
                            id="building"
                            name="building"
                            type="text"
                            placeholder="e.g., Perdana Exclusive"
                            value={address.building}
                            onChange={handleAddressChange}
                            required
                            className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="area" className="text-[#092635] font-medium">
                            Area
                          </Label>
                          <Input
                            id="area"
                            name="area"
                            type="text"
                            value={address.area}
                            onChange={handleAddressChange}
                            className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="postcode" className="text-[#092635] font-medium">
                            Postcode *
                          </Label>
                          <Input
                            id="postcode"
                            name="postcode"
                            type="text"
                            placeholder="e.g., 47820"
                            value={address.postcode}
                            onChange={handleAddressChange}
                            required
                            className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="city" className="text-[#092635] font-medium">
                          City
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          value={address.city}
                          onChange={handleAddressChange}
                          className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#1188E9] hover:bg-[#092635] text-white rounded-full font-medium"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Address
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
