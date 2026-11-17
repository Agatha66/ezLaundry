import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveModal } from '@/components/ResponsiveModal';
import { orderService } from '@/services/orderService';
import { POINTS_PER_REVIEW } from '@/lib/loyalty';
import { cn } from '@/lib/utils';
import type { Order, OrderRating } from '@/types';
import { SERVICE_NAMES } from './orderMeta';

const TAGS = ['On time', 'Friendly', 'Careful with clothes', 'Great communication'];
const LABELS = ['', 'Poor', 'Could be better', 'Okay', 'Great', 'Excellent!'];

interface RateRiderModalProps {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onRated?: () => void;
}

export function RateRiderModal({ order, onOpenChange, onRated }: RateRiderModalProps) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => { setStars(0); setHover(0); setTags([]); setComment(''); };
  const shown = hover || stars;

  const submit = async () => {
    if (!order || !stars) return;
    setSaving(true);
    try {
      await orderService.rateOrder(order.id, { stars: stars as OrderRating['stars'], tags, comment: comment.trim() || undefined });
      toast.success(`Thanks for rating ${order.riderName ?? 'your rider'}!`, { description: `+${POINTS_PER_REVIEW} ezPoints earned` });
      onRated?.();
      onOpenChange(false);
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save your rating');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal
      open={!!order}
      onOpenChange={o => { if (!o) reset(); onOpenChange(o); }}
      title="Rate your rider"
      description={order ? `Order #${order.id.slice(-4)} · ${SERVICE_NAMES[order.serviceType]}` : undefined}
      footer={
        <Button onClick={submit} disabled={!stars || saving} className="h-12 w-full rounded-xl text-base">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit review'}
        </Button>
      }
    >
      <div className="flex flex-col items-center pb-2 text-center">
        <span className="mb-2 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 font-poppins text-2xl font-semibold text-white">
          {order?.riderName?.charAt(0).toUpperCase() ?? 'R'}
        </span>
        <p className="font-semibold text-foreground">How was {order?.riderName ?? 'your rider'}?</p>

        <div className="my-4 flex gap-2" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map(n => (
            <motion.button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setStars(n)}
              whileTap={{ scale: 0.8 }}
              animate={{ scale: n <= shown ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15, delay: n <= stars && !hover ? n * 0.04 : 0 }}
            >
              <Star className={cn('h-9 w-9 transition-colors', n <= shown ? 'fill-amber-400 text-amber-400' : 'text-border')} />
            </motion.button>
          ))}
        </div>
        <p className="h-5 text-sm font-medium text-muted-foreground">{LABELS[shown]}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {TAGS.map(t => {
            const on = tags.includes(t);
            return (
              <motion.button
                key={t}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setTags(on ? tags.filter(x => x !== t) : [...tags, t])}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-colors',
                  on ? 'border-primary bg-primary text-white' : 'border-border text-foreground hover:bg-muted'
                )}
              >
                {t}
              </motion.button>
            );
          })}
        </div>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Anything else? (optional)"
          className="mt-4 min-h-20 rounded-xl"
          maxLength={300}
        />
      </div>
    </ResponsiveModal>
  );
}
