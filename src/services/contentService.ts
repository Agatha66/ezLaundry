import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Service, Testimonial, FAQItem, CoverageArea, PricingItem, ConveniencePass } from '@/types';

// Static data for initial launch (can be moved to Firestore later)
const staticServices: Service[] = [
  {
    id: 'wash-fold',
    name: 'Wash & Fold',
    description: 'Everyday laundry washed, dried, and neatly folded. Perfect for your regular clothes.',
    priceFrom: 8,
    unit: 'kg',
    minOrder: 'Minimum 3kg',
    icon: 'shirt',
  },
  {
    id: 'wash-iron',
    name: 'Wash & Iron',
    description: 'Complete service with professional pressing. Crisp, wrinkle-free clothes every time.',
    priceFrom: 12,
    unit: 'kg',
    minOrder: 'Per item pricing available',
    icon: 'iron',
  },
  {
    id: 'dry-clean',
    name: 'Dry Cleaning',
    description: 'Specialist care for delicate fabrics and formal wear. Gentle cleaning for premium garments.',
    priceFrom: 8,
    unit: 'item',
    minOrder: 'Premium items up to RM30',
    icon: 'jacket',
  },
];

const staticTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'Finally, a laundry service that understands busy professionals. The silent pickup is a game-changer!',
    name: 'Sarah L.',
    location: 'Damansara Perdana',
    rating: 5,
  },
  {
    id: '2',
    quote: 'Reliable, affordable, and the app is so easy to use. My laundry has never been this hassle-free.',
    name: 'Ahmad K.',
    location: 'Mutiara Damansara',
    rating: 5,
  },
  {
    id: '3',
    quote: 'The photo proof gives me peace of mind. I know exactly when my laundry is picked up and delivered.',
    name: 'Michelle T.',
    location: 'TTDI',
    rating: 5,
  },
];

const staticFAQ: FAQItem[] = [
  {
    id: '1',
    question: 'How do I schedule a pickup?',
    answer: 'Book through our app or website. Select your service, choose a pickup window, and leave your laundry in your designated drop zone. Our rider will collect it with photo proof.',
  },
  {
    id: '2',
    question: 'What is the turnaround time?',
    answer: 'Standard service is 48 hours. Express 24-hour service is available for an additional charge (limited slots).',
  },
  {
    id: '3',
    question: 'How is pricing calculated?',
    answer: 'Wash & fold is priced by weight (RM8-11/kg). Wash & iron and dry cleaning are priced per item. You\'ll see an estimate at checkout and final price after intake measurement.',
  },
  {
    id: '4',
    question: 'What is Silent Pickup & Return?',
    answer: 'For pre-approved buildings, we can pick up and deliver without you being present. Just leave your laundry in your designated drop zone (door hook, locker, or with concierge).',
  },
  {
    id: '5',
    question: 'What areas do you serve?',
    answer: 'We currently serve Damansara Perdana, Mutiara Damansara, TTDI, Bandar Utama, and Kelana Jaya. More areas coming soon!',
  },
  {
    id: '6',
    question: 'How do I know my laundry is safe?',
    answer: 'We use standardized bags with unique IDs and capture photo proofs at pickup and delivery. You can track your order status in real-time through the app.',
  },
];

const staticCoverageAreas: CoverageArea[] = [
  { id: '1', name: 'Damansara Perdana', status: 'active' },
  { id: '2', name: 'Mutiara Damansara', status: 'active' },
  { id: '3', name: 'Taman Tun Dr Ismail', status: 'active' },
  { id: '4', name: 'Bandar Utama', status: 'active' },
  { id: '5', name: 'Kelana Jaya', status: 'active' },
  { id: '6', name: 'Bangsar', status: 'coming-soon' },
  { id: '7', name: 'Mont Kiara', status: 'coming-soon' },
  { id: '8', name: 'KL City Centre', status: 'coming-soon' },
];

const staticPricing: PricingItem[] = [
  { service: 'Wash & Fold', price: 'RM8-11/kg', notes: 'Min 3-5kg' },
  { service: 'Wash & Iron', price: 'RM12-16/kg', notes: 'Or per item' },
  { service: 'Dry Clean', price: 'RM8-30/item', notes: 'By garment type' },
  { service: 'Delivery', price: 'RM5-8', notes: 'Free above min order' },
  { service: 'Express 24h', price: '+RM6-10', notes: 'Limited slots' },
];

const staticConveniencePasses: ConveniencePass[] = [
  {
    id: 'basic',
    name: 'Basic Pass',
    price: 39,
    benefits: ['Free delivery waiver (above min kg)', 'Priority slots'],
  },
  {
    id: 'standard',
    name: 'Standard Pass',
    price: 69,
    benefits: ['2 free deliveries per month', 'Express service discount'],
  },
  {
    id: 'premium',
    name: 'Premium Pass',
    price: 99,
    benefits: ['4 free deliveries per month', 'Priority support', 'Exclusive promotions'],
  },
];

export const contentService = {
  // Services
  async getServices(): Promise<Service[]> {
    try {
      const q = query(collection(db, 'services'), orderBy('priceFrom'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return staticServices;
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Service);
    } catch {
      return staticServices;
    }
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const q = query(collection(db, 'testimonials'), orderBy('rating', 'desc'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return staticTestimonials;
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Testimonial);
    } catch {
      return staticTestimonials;
    }
  },

  // FAQ
  async getFAQ(): Promise<FAQItem[]> {
    try {
      const q = query(collection(db, 'faq'), orderBy('id'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return staticFAQ;
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FAQItem);
    } catch {
      return staticFAQ;
    }
  },

  // Coverage Areas
  async getCoverageAreas(): Promise<CoverageArea[]> {
    try {
      const q = query(collection(db, 'serviceAreas'), orderBy('name'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return staticCoverageAreas;
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CoverageArea);
    } catch {
      return staticCoverageAreas;
    }
  },

  // Pricing
  async getPricing(): Promise<PricingItem[]> {
    try {
      const q = query(collection(db, 'pricing'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return staticPricing;
      }
      return snapshot.docs.map(doc => ({ ...doc.data() }) as PricingItem);
    } catch {
      return staticPricing;
    }
  },

  // Convenience Passes
  async getConveniencePasses(): Promise<ConveniencePass[]> {
    return staticConveniencePasses;
  },
};
