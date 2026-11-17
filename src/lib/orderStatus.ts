import type { OrderStatus } from '@/types';

// Status flow definition - defines which statuses can transition to which
export const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  'pending': ['accepted', 'cancelled'],
  'accepted': ['picking-up', 'cancelled'],
  'picking-up': ['picked-up'],
  'picked-up': ['to-laundry'],
  'to-laundry': ['at-laundry'],
  'at-laundry': ['washing'],
  'washing': ['washed'],
  'washed': ['delivering'],
  'delivering': ['delivered'],
  'delivered': ['completed'],
  'completed': [],
  'cancelled': [],
};

// Status labels for display
export const statusLabels: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  'pending': { label: 'Looking for Rider', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300', icon: '⏳' },
  'accepted': { label: 'Rider Assigned', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300', icon: '👤' },
  'picking-up': { label: 'Rider On The Way', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300', icon: '🛵' },
  'picked-up': { label: 'Collected', color: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300', icon: '✅' },
  'to-laundry': { label: 'To Laundry Facility', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300', icon: '🏭' },
  'at-laundry': { label: 'At Laundry', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300', icon: '📍' },
  'washing': { label: 'Washing In Progress', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300', icon: '🫧' },
  'washed': { label: 'Washing Complete', color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300', icon: '✨' },
  'delivering': { label: 'Delivering To You', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300', icon: '📦' },
  'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300', icon: '🎉' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300', icon: '⭐' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300', icon: '❌' },
};
