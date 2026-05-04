export type UserRole = 'customer' | 'rider' | 'admin' | 'system';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  address?: Address;
  role: UserRole;
  createdAt: Date;
}

export interface Address {
  street: string;
  unit?: string;
  building: string;
  area: string;
  city: string;
  postcode: string;
}

// Order Status Flow
export type OrderStatus = 
  | 'pending'           // Order created, waiting for rider
  | 'accepted'          // Rider accepted the job
  | 'picking-up'        // Rider on the way to customer
  | 'picked-up'         // Laundry collected from customer
  | 'to-laundry'        // On the way to laundry facility
  | 'at-laundry'        // Waiting to be washed
  | 'washing'           // Currently being washed
  | 'washed'            // Washing completed
  | 'delivering'        // On the way to deliver to customer
  | 'delivered'         // Delivered to customer
  | 'completed'         // Order fully completed
  | 'cancelled';        // Order cancelled

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: Address;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  serviceType: 'wash-fold' | 'wash-iron' | 'dry-clean';
  status: OrderStatus;
  weight?: number;
  // Item tracking
  declaredItemCount: number;        // Number of items customer declares
  actualItemCount?: number;         // Actual count by rider at pickup
  pickupNotes?: string;             // Notes from rider at pickup
  specialInstructions?: string;     // Customer's special instructions
  pickupDate: Date;
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening';
  estimatedPrice: number;
  estimatedWeight: number;
  finalPrice?: number;
  deliveryFee: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
  paymentMethod?: 'cash' | 'card' | 'ewallet';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  // Status timestamps for tracking
  statusHistory: StatusHistoryItem[];
  // Photos
  pickupPhoto?: string;
  deliveryPhoto?: string;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
  updatedBy: string; // user ID
}

export interface Service {
  id: string;
  name: string;
  description: string;
  priceFrom: number;
  unit: string;
  minOrder?: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CoverageArea {
  id: string;
  name: string;
  status: 'active' | 'coming-soon';
  coordinates?: { lat: number; lng: number };
}

export interface PricingItem {
  service: string;
  price: string;
  notes: string;
}

export interface ConveniencePass {
  id: string;
  name: string;
  price: number;
  benefits: string[];
}

export interface HowItWorksStep {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// Rider Job type for rider dashboard
export interface RiderJob {
  order: Order;
  distance?: number;
  estimatedTime?: number;
}

// Chat types
export interface Chat {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  riderId: string;
  riderName: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCountCustomer?: number;
  unreadCountRider?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  read: boolean;
}
