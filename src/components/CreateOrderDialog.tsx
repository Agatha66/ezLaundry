import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Sparkles, Archive, Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { orderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, Address } from '@/types';

interface CreateOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const services = [
  { 
    id: 'wash-fold', 
    name: 'Wash & Fold', 
    description: 'Everyday laundry washed, dried, and neatly folded',
    pricePerKg: 8, 
    minKg: 3,
    icon: Shirt,
    color: 'bg-[#1188E9]'
  },
  { 
    id: 'wash-iron', 
    name: 'Wash & Iron', 
    description: 'Complete service with professional pressing',
    pricePerKg: 12, 
    minKg: 3,
    icon: Sparkles,
    color: 'bg-[#1A7A7E]'
  },
  { 
    id: 'dry-clean', 
    name: 'Dry Clean', 
    description: 'Specialist care for delicate fabrics',
    pricePerKg: 15, 
    minKg: 2,
    icon: Archive,
    color: 'bg-[#092635]'
  },
];

const timeSlots = [
  { value: 'morning', label: 'Morning (8AM - 12PM)', icon: '☀️' },
  { value: 'afternoon', label: 'Afternoon (12PM - 4PM)', icon: '🌤️' },
  { value: 'evening', label: 'Evening (4PM - 8PM)', icon: '🌙' },
];

export function CreateOrderDialog({ isOpen, onClose, onOrderCreated }: CreateOrderDialogProps) {
  const { userData } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get saved address from user profile
  const getSavedAddress = (): Address => {
    if (userData?.address) {
      return userData.address;
    }
    return {
      street: '',
      unit: '',
      building: '',
      area: 'Damansara Perdana',
      city: 'Petaling Jaya',
      postcode: '',
    };
  };

  // Form state
  const [selectedService, setSelectedService] = useState(services[0]);
  const [estimatedWeight, setEstimatedWeight] = useState(3);
  const [declaredItemCount, setDeclaredItemCount] = useState(5);
  const [pickupDate, setPickupDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [address, setAddress] = useState<Address>(getSavedAddress());

  // Update address when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAddress(getSavedAddress());
    }
  }, [isOpen, userData?.address]);

  const resetForm = () => {
    setStep(1);
    setSelectedService(services[0]);
    setEstimatedWeight(3);
    setDeclaredItemCount(5);
    setPickupDate('');
    setTimeSlot('morning');
    setSpecialInstructions('');
    setAddress({
      street: '',
      unit: '',
      building: '',
      area: 'Damansara Perdana',
      city: 'Petaling Jaya',
      postcode: '',
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const calculateEstimatedPrice = () => {
    return selectedService.pricePerKg * estimatedWeight;
  };

  const handleSubmit = async () => {
    if (!userData) {
      setError('Please log in to create an order');
      return;
    }

    // Validate all required fields
    if (!pickupDate) {
      setError('Please select a pickup date');
      setStep(3);
      return;
    }

    if (!address.street || !address.building || !address.postcode) {
      setError('Please complete your address');
      setStep(4);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const estimatedPrice = calculateEstimatedPrice();
      const deliveryFee = 5;

      const orderData = {
        customerId: userData.uid,
        customerName: userData.displayName || 'Customer',
        customerPhone: userData.phone || '',
        customerAddress: address,
        serviceType: selectedService.id as 'wash-fold' | 'wash-iron' | 'dry-clean',
        estimatedPrice,
        estimatedWeight,
        declaredItemCount,
        deliveryFee,
        totalAmount: estimatedPrice + deliveryFee,
        specialInstructions,
        pickupDate: new Date(pickupDate),
        preferredTimeSlot: timeSlot as 'morning' | 'afternoon' | 'evening',
        paymentStatus: 'pending' as const,
      };

      console.log('Creating order:', orderData);
      const order = await orderService.createOrder(orderData);
      console.log('Order created:', order);
      
      // Call the callback before closing
      onOrderCreated(order);
      
      // Reset and close
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return true; // Service selection always valid
      case 2:
        return estimatedWeight >= selectedService.minKg;
      case 3:
        return pickupDate && timeSlot;
      case 4:
        return address.street && address.building && address.postcode;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-[#4A6375] text-sm">Select a service for your laundry</p>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    selectedService.id === service.id
                      ? 'border-[#1188E9] bg-[#E6F4FF]'
                      : 'border-[#D8E5EF] hover:border-[#1188E9]/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#092635]">{service.name}</h3>
                        <span className="text-[#1188E9] font-semibold">RM{service.pricePerKg}/kg</span>
                      </div>
                      <p className="text-sm text-[#4A6375] mt-1">{service.description}</p>
                      <p className="text-xs text-[#4A6375] mt-2">Min {service.minKg}kg</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-[#092635] font-medium">Estimated Weight (kg)</Label>
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => setEstimatedWeight(Math.max(selectedService.minKg, estimatedWeight - 1))}
                  className="w-10 h-10 rounded-full bg-[#F5F7F9] hover:bg-[#E6F4FF] flex items-center justify-center text-[#092635] font-semibold"
                >
                  -
                </button>
                <span className="text-3xl font-semibold text-[#092635] w-16 text-center">
                  {estimatedWeight}
                </span>
                <button
                  onClick={() => setEstimatedWeight(estimatedWeight + 1)}
                  className="w-10 h-10 rounded-full bg-[#F5F7F9] hover:bg-[#E6F4FF] flex items-center justify-center text-[#092635] font-semibold"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-[#4A6375] mt-2">
                Minimum {selectedService.minKg}kg required
              </p>
            </div>

            <div>
              <Label className="text-[#092635] font-medium">Number of Items</Label>
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => setDeclaredItemCount(Math.max(1, declaredItemCount - 1))}
                  className="w-10 h-10 rounded-full bg-[#F5F7F9] hover:bg-[#E6F4FF] flex items-center justify-center text-[#092635] font-semibold"
                >
                  -
                </button>
                <span className="text-3xl font-semibold text-[#092635] w-16 text-center">
                  {declaredItemCount}
                </span>
                <button
                  onClick={() => setDeclaredItemCount(declaredItemCount + 1)}
                  className="w-10 h-10 rounded-full bg-[#F5F7F9] hover:bg-[#E6F4FF] flex items-center justify-center text-[#092635] font-semibold"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-[#4A6375] mt-2">
                Total number of items you&apos;re sending
              </p>
            </div>

            <div className="p-4 bg-[#F5F7F9] rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-[#4A6375]">Estimated Price</span>
                <span className="text-xl font-semibold text-[#1188E9]">
                  RM{calculateEstimatedPrice()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-[#4A6375]">Delivery Fee</span>
                <span className="text-[#092635]">RM5</span>
              </div>
              <div className="border-t border-[#D8E5EF] mt-2 pt-2 flex items-center justify-between">
                <span className="font-medium text-[#092635]">Total Estimate</span>
                <span className="text-xl font-bold text-[#092635]">
                  RM{calculateEstimatedPrice() + 5}
                </span>
              </div>
              <p className="text-xs text-[#4A6375] mt-2">
                * Final price will be confirmed after weighing
              </p>
            </div>

            <div>
              <Label className="text-[#092635] font-medium">Special Instructions (Optional)</Label>
              <Textarea
                placeholder="Any special requests, stains to note, etc."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="mt-2 min-h-[100px] rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-[#092635] font-medium">Pickup Date</Label>
              <Input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
              />
            </div>

            <div>
              <Label className="text-[#092635] font-medium">Preferred Time Slot</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => setTimeSlot(slot.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                      timeSlot === slot.value
                        ? 'border-[#1188E9] bg-[#E6F4FF]'
                        : 'border-[#D8E5EF] hover:border-[#1188E9]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{slot.icon}</span>
                      <span className="font-medium text-[#092635]">{slot.label}</span>
                      {timeSlot === slot.value && (
                        <Check className="w-5 h-5 text-[#1188E9] ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        const hasSavedAddress = userData?.address?.street && userData?.address?.building;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1188E9]" />
              <p className="text-[#092635] font-medium">Pickup Address</p>
            </div>
            
            {hasSavedAddress && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <Check className="w-4 h-4 inline mr-1" />
                  Using your saved address. You can edit it below if needed.
                </p>
              </div>
            )}
            
            <div>
              <Label className="text-[#092635] font-medium">Street Address *</Label>
              <Input
                placeholder="e.g., Jalan PJU 8/1"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="mt-1.5 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#092635] font-medium">Unit/Floor (Optional)</Label>
                <Input
                  placeholder="e.g., Unit 5-2"
                  value={address.unit}
                  onChange={(e) => setAddress({ ...address, unit: e.target.value })}
                  className="mt-1.5 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
                />
              </div>
              <div>
                <Label className="text-[#092635] font-medium">Building/Block</Label>
                <Input
                  placeholder="e.g., Perdana Exclusive"
                  value={address.building}
                  onChange={(e) => setAddress({ ...address, building: e.target.value })}
                  className="mt-1.5 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#092635] font-medium">Area</Label>
                <Input
                  value={address.area}
                  onChange={(e) => setAddress({ ...address, area: e.target.value })}
                  className="mt-1.5 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
                />
              </div>
              <div>
                <Label className="text-[#092635] font-medium">Postcode</Label>
                <Input
                  placeholder="e.g., 47820"
                  value={address.postcode}
                  onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                  className="mt-1.5 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#092635] font-medium">City</Label>
              <Input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="mt-1.5 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9]"
                />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#092635]">Review Your Order</h3>
            </div>

            <div className="bg-[#F5F7F9] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#4A6375]">Service</span>
                <span className="font-medium text-[#092635]">{selectedService.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4A6375]">Estimated Weight</span>
                <span className="font-medium text-[#092635]">{estimatedWeight} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4A6375]">Number of Items</span>
                <span className="font-medium text-[#092635]">{declaredItemCount} items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4A6375]">Pickup Date</span>
                <span className="font-medium text-[#092635]">{pickupDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4A6375]">Time Slot</span>
                <span className="font-medium text-[#092635]">
                  {timeSlots.find(t => t.value === timeSlot)?.label}
                </span>
              </div>
              <div className="border-t border-[#D8E5EF] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4A6375]">Estimated Price</span>
                  <span className="font-medium text-[#092635]">RM{calculateEstimatedPrice()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[#4A6375]">Delivery Fee</span>
                  <span className="font-medium text-[#092635]">RM5</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#D8E5EF]">
                  <span className="font-semibold text-[#092635]">Total</span>
                  <span className="text-xl font-bold text-[#1188E9]">RM{calculateEstimatedPrice() + 5}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#4A6375] text-center">
              By placing this order, you agree to our Terms of Service
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Select Service', 'Order Details', 'Schedule', 'Address', 'Review'];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#092635]">
            Create New Order
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {stepTitles.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > index + 1
                    ? 'bg-green-500 text-white'
                    : step === index + 1
                    ? 'bg-[#1188E9] text-white'
                    : 'bg-[#D8E5EF] text-[#4A6375]'
                }`}
              >
                {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < stepTitles.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-[#D8E5EF]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <p className="text-center text-sm text-[#4A6375] mb-4">
          Step {step} of {stepTitles.length}: {stepTitles[step - 1]}
        </p>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12 rounded-xl border-[#D8E5EF]"
            >
              Back
            </Button>
          )}
          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className="flex-1 h-12 bg-[#1188E9] hover:bg-[#092635] text-white rounded-xl"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 bg-[#1188E9] hover:bg-[#092635] text-white rounded-xl"
            >
              {loading ? 'Creating Order...' : 'Place Order'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
