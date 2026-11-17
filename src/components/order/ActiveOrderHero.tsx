import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE_OUT } from '@/components/motion';
import type { Order } from '@/types';
import { SERVICE_NAMES, TRACK_STEPS, trackIndex } from './orderMeta';

const SLOT_LABEL: Record<Order['preferredTimeSlot'], string> = {
  morning: '8 AM – 12 PM',
  afternoon: '12 – 4 PM',
  evening: '4 – 8 PM',
};

/** Big gradient card showing the live status of the customer's most recent active order. */
export function ActiveOrderHero({ order, extra = 0 }: { order: Order; extra?: number }) {
  const navigate = useNavigate();
  const idx = trackIndex(order.status);
  const step = TRACK_STEPS[idx];
  const pct = Math.round((idx / (TRACK_STEPS.length - 1)) * 100);

  return (
    <motion.button
      onClick={() => navigate(`/order/${order.id}`)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0B5FA8] to-navy p-5 text-left text-white shadow-xl shadow-primary/25 sm:p-6"
    >
      <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-20 right-10 h-36 w-36 rounded-full bg-white/[0.07]" />

      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live · #{order.id.slice(-4)}
          {extra > 0 && <span className="text-white/70">+{extra} more</span>}
        </span>
        <motion.span
          className="text-3xl"
          animate={{ y: [0, -4, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {step.icon}
        </motion.span>
      </div>

      <h2 className="relative mt-3 font-poppins text-xl font-semibold sm:text-2xl">{step.label}</h2>
      <p className="relative text-sm text-white/75">
        {SERVICE_NAMES[order.serviceType]} · {order.estimatedWeight} kg · {SLOT_LABEL[order.preferredTimeSlot] ?? order.preferredTimeSlot}
      </p>

      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/20">
        <motion.div
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-sky-300 to-white"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, 6)}%` }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.2 }}
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
      <div className="relative mt-2 flex justify-between text-[11px] text-white/70">
        <span>Pickup</span>
        <span>Washing</span>
        <span>Delivery</span>
      </div>
    </motion.button>
  );
}
