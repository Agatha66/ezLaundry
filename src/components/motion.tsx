import { useEffect, useRef } from 'react';
import { animate, motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Route-level enter/exit transition. */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};
const staggerChild = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE_OUT } },
};

/** Children wrapped in <StaggerItem> animate in one after another. */
export function Stagger({ className, children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div className={className} variants={staggerParent} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div className={className} variants={staggerChild} {...rest}>
      {children}
    </motion.div>
  );
}

/** Lifts on hover, shrinks on press. */
export function Pressable({ className, children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      className={cn('cursor-pointer', className)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Animated number that counts up on mount and whenever its value changes. */
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const format = (v: number) =>
      `${prefix}${v.toLocaleString('en-MY', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
    if (reduceMotion) {
      from.current = value;
      node.textContent = format(value);
      return;
    }
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: EASE_OUT,
      onUpdate: v => {
        from.current = v;
        node.textContent = format(v);
      },
      onComplete: () => {
        from.current = value;
        node.textContent = format(value);
      },
    });
    return () => controls.stop();
  }, [value, prefix, suffix, decimals, reduceMotion]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}0{suffix}
    </span>
  );
}
